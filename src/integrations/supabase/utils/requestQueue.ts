
import { requestCache } from './requestCache';

// Request queue implementation with improved throttling and response handling
export class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private concurrentRequests = 0;
  private maxConcurrentRequests = 1; // Reduced to 1 for stricter throttling
  private requestDelay = 1500; // Increased to 1500ms to prevent rapid requests
  private lastRequestTime = 0;
  private rateLimitedUntil = 0;
  private pauseUntil = 0;

  async add<T>(request: () => Promise<T>, cacheKey?: string): Promise<T> {
    // Check if response is in memory cache
    if (cacheKey && requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        console.log(`Using in-memory cache for ${cacheKey}`);
        return cached.data;
      } else if (cached) {
        requestCache.delete(cacheKey); // Expired cache
      }
    }
    
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Check if we're rate limited or paused
          const now = Date.now();
          const waitUntil = Math.max(this.rateLimitedUntil, this.pauseUntil);
          
          if (waitUntil > now) {
            const waitTime = waitUntil - now;
            console.log(`Rate limited or paused, waiting ${waitTime}ms`);
            await new Promise(r => setTimeout(r, waitTime));
          }
          
          // Ensure minimum delay between requests
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.requestDelay) {
            const waitTime = this.requestDelay - timeSinceLastRequest;
            await new Promise(r => setTimeout(r, waitTime));
          }
          
          this.lastRequestTime = Date.now();
          
          // Execute the request
          const result = await request();
          
          // Cache the successful response if cache key was provided
          if (cacheKey) {
            requestCache.set(cacheKey, {
              data: result,
              expiry: Date.now() + 60000 // 60 seconds memory cache
            });
          }
          
          resolve(result);
        } catch (error: any) {
          // If we got a 429 (too many requests), set a longer backoff
          if (error?.status === 429) {
            this.rateLimitedUntil = Date.now() + 120000; // 2 minute backoff
            console.warn('Rate limit encountered, backing off for 2 minutes');
          } 
          // For other errors, brief pause
          else {
            this.pauseUntil = Date.now() + 5000;
            console.warn('Request error, pausing for 5 seconds');
          }
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.concurrentRequests >= this.maxConcurrentRequests) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.concurrentRequests < this.maxConcurrentRequests) {
      const request = this.queue.shift();
      if (!request) continue;

      this.concurrentRequests++;
      
      try {
        await request();
      } catch (error) {
        console.error('Error processing queued request:', error);
      } finally {
        this.concurrentRequests--;
      }
    }

    this.processing = false;
    
    // If there are still items and we have capacity, process more
    if (this.queue.length > 0 && this.concurrentRequests < this.maxConcurrentRequests) {
      this.processQueue();
    }
  }
}

// Create a global request queue
export const requestQueue = new RequestQueue();
