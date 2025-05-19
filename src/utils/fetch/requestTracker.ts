/**
 * Request tracker to prevent too many requests being sent at once and properly handle response caching
 */

import { createResponseFromCachedData } from '../../integrations/supabase/utils/responseUtils';

// Simple in-memory cache to prevent duplicate requests
const responseCache = new Map<string, { data: any; expiry: number }>();

type PendingRequest = {
  resolve: () => void;
  priority: number;
  timestamp: number;
};

class RequestTracker {
  private activeRequests = 0;
  private maxConcurrentRequests = 8; // Increased for smoother operation but still controlled
  private pendingQueue: PendingRequest[] = [];
  private processingQueue = false;
  private requestDelayMs = 100; // Small delay between requests
  private lastRequestTime = 0;
  private rateLimitedUntil = 0;

  // Add a request to the queue and wait until it can be processed
  async add<T>(requestFn: () => Promise<T>, cacheKey?: string): Promise<T> {
    // Check cache first if we have a cache key
    if (cacheKey && responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        console.log(`Using request cache for ${cacheKey}`);
        return cached.data as T;
      } else if (cached) {
        responseCache.delete(cacheKey); // Remove expired cache entry
      }
    }

    // If we haven't hit our limit, process immediately
    if (this.activeRequests < this.maxConcurrentRequests) {
      return this.executeRequest(requestFn, cacheKey);
    }

    // Otherwise, queue the request
    return new Promise<T>((resolve, reject) => {
      const priority = cacheKey ? 0 : 1; // Give priority to requests with cache keys
      
      // Add to pending queue
      const queued: PendingRequest = {
        resolve: async () => {
          try {
            const result = await this.executeRequest(requestFn, cacheKey);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        priority,
        timestamp: Date.now()
      };
      
      this.pendingQueue.push(queued);
      
      // Ensure the queue processing starts
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  }
  
  // Check if we need to wait before sending another request
  async checkAndWait(): Promise<void> {
    const now = Date.now();
    
    // Check if we're rate limited
    if (now < this.rateLimitedUntil) {
      const waitTime = this.rateLimitedUntil - now;
      console.log(`Rate limited. Waiting ${waitTime}ms before continuing.`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return;
    }
    
    // Check if we need to throttle based on request delay
    if (this.lastRequestTime > 0) {
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.requestDelayMs) {
        const waitTime = this.requestDelayMs - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.lastRequestTime = Date.now();
  }
  
  // Release a request slot
  releaseRequest(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    this.processQueue();
  }
  
  // Set rate limiting
  setRateLimit(durationMs: number): void {
    this.rateLimitedUntil = Date.now() + durationMs;
    console.warn(`Rate limit set for ${durationMs}ms until ${new Date(this.rateLimitedUntil).toISOString()}`);
  }

  // Execute a request with tracking
  private async executeRequest<T>(requestFn: () => Promise<T>, cacheKey?: string): Promise<T> {
    this.activeRequests++;
    
    try {
      // Check if we need to wait due to rate limiting or throttling
      await this.checkAndWait();
      
      // Execute the request
      const result = await requestFn();
      
      // Cache the result if cache key provided
      if (cacheKey && result !== undefined) {
        responseCache.set(cacheKey, {
          data: result,
          expiry: Date.now() + 60000 // 60 second cache by default
        });
      }
      
      return result;
    } catch (error: any) {
      // Check for rate limit errors
      if (error?.status === 429 || (error?.message && error.message.includes('429'))) {
        this.setRateLimit(30000); // 30 seconds rate limit backoff
      }
      throw error;
    } finally {
      this.releaseRequest();
    }
  }

  // Process pending requests in the queue
  private async processQueue() {
    if (this.processingQueue || this.activeRequests >= this.maxConcurrentRequests || this.pendingQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      // Sort queue by priority (lower number = higher priority) and then by timestamp
      this.pendingQueue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.timestamp - b.timestamp;
      });
      
      // Process as many requests as we can
      while (this.pendingQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
        const next = this.pendingQueue.shift();
        if (next) {
          next.resolve();
        }
      }
    } finally {
      this.processingQueue = false;
      
      // If there are still pending requests and slots available, process again
      if (this.pendingQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
        setTimeout(() => this.processQueue(), 0);
      }
    }
  }
}

export const requestTracker = new RequestTracker();
