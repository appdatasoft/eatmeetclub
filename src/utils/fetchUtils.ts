
/**
 * Utility for implementing exponential backoff with rate limiting
 */

// Track request counts to prevent overwhelming the API
const requestTracker = {
  count: 0,
  lastReset: Date.now(),
  maxRequestsPerMinute: 60, // Adjust based on API limits
  
  async checkAndWait() {
    // Reset counter after a minute
    if (Date.now() - this.lastReset > 60000) {
      this.count = 0;
      this.lastReset = Date.now();
    }
    
    this.count++;
    
    // If we're hitting our limit, add artificial delay
    if (this.count > this.maxRequestsPerMinute) {
      const waitTime = Math.min(5000, Math.pow(2, this.count - this.maxRequestsPerMinute) * 100);
      console.warn(`Rate limiting, waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
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
 * Executes a fetch operation with exponential backoff retries
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: FetchRetryOptions = {}
): Promise<T> => {
  const {
    retries = 3,
    baseDelay = 500,
    maxDelay = 10000,
    shouldRetry = () => true
  } = options;
  
  let attempt = 0;
  
  while (true) {
    try {
      // Check if we need to wait due to rate limiting
      await requestTracker.checkAndWait();
      
      // Try the fetch operation
      return await fetchFn();
    } catch (error: any) {
      attempt++;
      
      // If we've used all retries or shouldn't retry this particular error
      if (attempt >= retries || !shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff + some randomness
      const delay = Math.min(
        maxDelay,
        Math.pow(2, attempt) * baseDelay + Math.random() * 100
      );
      
      console.warn(
        `Request failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`, 
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
export const createOfflineCache = <T>(cacheKey: string, ttlMs = 5 * 60 * 1000) => {
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
