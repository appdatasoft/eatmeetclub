
/**
 * Retry mechanism for fetch operations
 */

export interface FetchRetryOptions {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Executes a function with retry logic using exponential backoff
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
      debugInfo.attempts++;
      
      // Try the fetch operation
      const result = await fetchFn();
      
      // Log success info for debugging
      debugInfo.totalTime = Date.now() - startTime;
      console.log(`Request succeeded after ${debugInfo.attempts} attempt(s) and ${debugInfo.totalTime}ms`);
      
      return result;
    } catch (error: any) {
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
 * Creates a cached version of a fetch function
 */
export const fetchWithCache = <T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  cacheDuration: number = 5 * 60 * 1000 // 5 minutes by default
): () => Promise<T> => {
  return async () => {
    // Check if we have a cached result
    const cachedItem = sessionStorage.getItem(cacheKey);
    if (cachedItem) {
      const { data, expiry } = JSON.parse(cachedItem);
      if (expiry > Date.now()) {
        console.log(`Using cached data for ${cacheKey}`);
        return data as T;
      }
      // Cache expired, remove it
      sessionStorage.removeItem(cacheKey);
    }
    
    // No cache or expired cache, fetch fresh data
    const result = await fetchFn();
    
    // Store in cache
    const cacheData = {
      data: result,
      expiry: Date.now() + cacheDuration
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    return result;
  };
};
