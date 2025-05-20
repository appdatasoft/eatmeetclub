
/**
 * A queue to manage concurrent requests and prevent rate limiting
 */
export class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private concurrentRequests = 0;
  private maxConcurrentRequests = 3;
  private requestDelay = 300; // ms
  private cacheMap = new Map<string, { response: Response, timestamp: number }>();
  private cacheTTL = 60 * 1000; // 1 minute

  async add<T>(request: () => Promise<T>, cacheKey?: string): Promise<T> {
    // Try to return from cache first if cache key exists
    if (cacheKey && this.cacheMap.has(cacheKey)) {
      const cached = this.cacheMap.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        try {
          // Clone the response to avoid body already read issues
          const clonedResponse = cached.response.clone();
          // For non-GET methods, we should not cache
          return clonedResponse as unknown as T;
        } catch (e) {
          console.warn('Failed to use cached response:', e);
          // Continue to fresh request if we can't use cache
        }
      } else {
        // Cache expired, remove it
        this.cacheMap.delete(cacheKey);
      }
    }

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          
          // Cache the result if we have a cache key and it's a Response object
          if (cacheKey && result instanceof Response) {
            try {
              // Store a clone in the cache
              this.cacheMap.set(cacheKey, { 
                response: result.clone(),
                timestamp: Date.now()
              });
            } catch (cacheError) {
              console.warn('Failed to cache response:', cacheError);
            }
          }
          
          resolve(result);
        } catch (error) {
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
        // Add a delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
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

// Create a singleton instance
export const requestQueue = new RequestQueue();
