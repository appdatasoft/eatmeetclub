/**
 * Utility for implementing exponential backoff with rate limiting
 */

// Global request tracker with more sophisticated throttling
const requestTracker = {
  count: 0,
  lastReset: Date.now(),
  maxRequestsPerMinute: 30, // Reduced from 60 to 30
  inProgressRequests: 0,
  maxConcurrentRequests: 3,
  requestQueue: [] as Array<() => void>,
  
  async checkAndWait() {
    // Reset counter after a minute
    if (Date.now() - this.lastReset > 60000) {
      this.count = 0;
      this.lastReset = Date.now();
    }
    
    this.count++;
    
    // If we're at our concurrent limit, queue the request
    if (this.inProgressRequests >= this.maxConcurrentRequests) {
      return new Promise<void>(resolve => {
        this.requestQueue.push(resolve);
      });
    }
    
    // If we're hitting our rate limit, add artificial delay
    if (this.count > this.maxRequestsPerMinute) {
      const waitTime = Math.min(10000, Math.pow(2, this.count - this.maxRequestsPerMinute) * 200);
      console.warn(`Rate limiting, waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.inProgressRequests++;
    return Promise.resolve();
  },
  
  releaseRequest() {
    this.inProgressRequests--;
    
    // Process next request from queue if any
    if (this.requestQueue.length > 0 && this.inProgressRequests < this.maxConcurrentRequests) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) nextRequest();
    }
  }
};

export interface FetchRetryOptions {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Executes a fetch operation with exponential backoff retries and throttling
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: FetchRetryOptions = {}
): Promise<T> => {
  const {
    retries = 3,
    baseDelay = 1000,
    maxDelay = 15000,
    shouldRetry = () => true
  } = options;
  
  let attempt = 0;
  
  // Add debug info
  const startTime = Date.now();
  const debugInfo = {
    startTime,
    attempts: 0,
    totalTime: 0
  };
  
  while (true) {
    try {
      // Check if we need to wait due to rate limiting
      await requestTracker.checkAndWait();
      
      debugInfo.attempts++;
      
      // Try the fetch operation
      const result = await fetchFn();
      
      // Release the request slot
      requestTracker.releaseRequest();
      
      // Log success info for debugging
      debugInfo.totalTime = Date.now() - startTime;
      console.log(`Request succeeded after ${debugInfo.attempts} attempt(s) and ${debugInfo.totalTime}ms`);
      
      return result;
    } catch (error: any) {
      // Release the request slot even on error
      requestTracker.releaseRequest();
      
      attempt++;
      
      // If we've used all retries or shouldn't retry this particular error
      if (attempt >= retries || !shouldRetry(error)) {
        // Log failure info for debugging
        debugInfo.totalTime = Date.now() - startTime;
        console.error(`Request failed permanently after ${debugInfo.attempts} attempt(s) and ${debugInfo.totalTime}ms`, error);
        
        throw error;
      }
      
      // Calculate delay with exponential backoff + jitter
      const jitter = Math.random() * 500; // Add up to 500ms of randomness
      const delay = Math.min(
        maxDelay,
        Math.pow(2, attempt) * baseDelay + jitter
      );
      
      console.warn(
        `Request failed (attempt ${attempt}/${retries}). Retrying in ${Math.round(delay)}ms...`, 
        error
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Creates an offline-first cache for fetch operations
 */
export const createOfflineCache = <T>(cacheKey: string, ttlMs = 10 * 60 * 1000) => {
  return {
    get: (): T | null => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        
        // Check if cache has expired
        if (Date.now() - timestamp > ttlMs) {
          localStorage.removeItem(cacheKey);
          return null;
        }
        
        return data;
      } catch (e) {
        console.error('Cache retrieval error:', e);
        return null;
      }
    },
    
    set: (data: T): void => {
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data,
            timestamp: Date.now()
          })
        );
      } catch (e) {
        console.error('Cache storage error:', e);
      }
    }
  };
};

/**
 * Advanced session storage cache with progressive TTL
 */
export const createSessionCache = <T>(
  cacheKey: string, 
  baseTtlMs = 5 * 60 * 1000, // 5 minutes default
  options = { maxItems: 50 }
) => {
  // Helper to clean up old cache entries if we have too many
  const cleanupOldEntries = () => {
    try {
      const allKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_')) {
          allKeys.push(key);
        }
      }
      
      if (allKeys.length > options.maxItems) {
        // Get all cached items with timestamps
        const items = allKeys.map(key => {
          try {
            const value = sessionStorage.getItem(key);
            if (!value) return { key, timestamp: 0 };
            const { timestamp } = JSON.parse(value);
            return { key, timestamp };
          } catch {
            return { key, timestamp: 0 };
          }
        });
        
        // Sort by oldest first
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest items
        const toRemove = items.slice(0, items.length - options.maxItems);
        toRemove.forEach(item => {
          sessionStorage.removeItem(item.key);
        });
      }
    } catch (e) {
      console.warn('Error cleaning up cache:', e);
    }
  };
  
  return {
    get: (): T | null => {
      try {
        const cached = sessionStorage.getItem(`cache_${cacheKey}`);
        if (!cached) return null;
        
        const { data, timestamp, accessCount = 0 } = JSON.parse(cached);
        
        // Progressive TTL - the more an item is accessed, the longer we keep it
        const adjustedTtl = baseTtlMs * Math.min(3, Math.max(1, 1 + accessCount * 0.2));
        
        // Check if cache has expired
        if (Date.now() - timestamp > adjustedTtl) {
          sessionStorage.removeItem(`cache_${cacheKey}`);
          return null;
        }
        
        // Update access count
        sessionStorage.setItem(`cache_${cacheKey}`, JSON.stringify({
          data,
          timestamp,
          accessCount: accessCount + 1
        }));
        
        return data;
      } catch (e) {
        console.error('SessionCache retrieval error:', e);
        return null;
      }
    },
    
    set: (data: T): void => {
      try {
        sessionStorage.setItem(
          `cache_${cacheKey}`,
          JSON.stringify({
            data,
            timestamp: Date.now(),
            accessCount: 0
          })
        );
        
        // Clean up old entries if needed
        cleanupOldEntries();
      } catch (e) {
        console.error('SessionCache storage error:', e);
        // Try removing some items to make space
        try {
          cleanupOldEntries();
          // Try again
          sessionStorage.setItem(
            `cache_${cacheKey}`,
            JSON.stringify({
              data,
              timestamp: Date.now(),
              accessCount: 0
            })
          );
        } catch {
          // Just give up if it still fails
        }
      }
    },
    
    // Force remove a cache entry
    remove: (): void => {
      try {
        sessionStorage.removeItem(`cache_${cacheKey}`);
      } catch (e) {
        console.error('SessionCache removal error:', e);
      }
    }
  };
};
