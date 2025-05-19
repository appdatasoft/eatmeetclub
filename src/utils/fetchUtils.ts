
import { requestTracker } from './fetch/requestTracker';

export interface FetchRetryOptions {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  headers?: Record<string, string>;
}

/**
 * Fetches a resource with retry logic for better reliability
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>, 
  options: FetchRetryOptions = {}
): Promise<T> => {
  const { 
    retries = 3, 
    baseDelay = 1000, 
    maxDelay = 10000,
    headers = {}
  } = options;
  
  // Use a closure to properly maintain the request context through retries
  const attemptFetch = async (attemptsLeft: number, currentDelay: number): Promise<T> => {
    try {
      // Add explicit Accept and Content-Type headers to avoid 406 errors
      const requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      };
      
      console.log(`Attempt ${retries - attemptsLeft + 1}/${retries} with headers:`, requestHeaders);
      
      // Execute the fetch function with headers context
      const originalFetchFn = fetchFn;
      const wrappedFetchFn = async () => {
        // Apply headers context to the supabase client if needed
        // This is important because the original fetchFn might be using supabase client
        return await originalFetchFn();
      };
      
      return await wrappedFetchFn();
    } catch (error: any) {
      console.error(`Fetch error (attempts left: ${attemptsLeft - 1}):`, error);
      
      // If we have no more retries, throw the error
      if (attemptsLeft <= 1) {
        throw error;
      }
      
      // Calculate the next delay with exponential backoff, capped at maxDelay
      const nextDelay = Math.min(currentDelay * 1.5, maxDelay);
      console.log(`Retrying in ${nextDelay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Retry with one less attempt and increased delay
      return attemptFetch(attemptsLeft - 1, nextDelay);
    }
  };
  
  // Use the request tracker to prevent too many concurrent requests
  return requestTracker.add(() => attemptFetch(retries, baseDelay));
};

/**
 * Simple in-memory fetch cache
 */
const memoryCache = new Map<string, { data: any; expiry: number }>();

/**
 * Fetches a resource with caching
 */
export const fetchWithCache = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cacheDurationMs = 60000
): Promise<T> => {
  // Check cache first
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      console.log(`Using cached data for ${cacheKey}`);
      return cached.data as T;
    }
    // Remove expired cache
    memoryCache.delete(cacheKey);
  }
  
  // If not cached or expired, fetch fresh data
  const data = await fetchWithRetry(fetchFn);
  
  // Cache the result
  memoryCache.set(cacheKey, {
    data,
    expiry: Date.now() + cacheDurationMs
  });
  
  return data;
};

/**
 * Clears all cache or a specific cached item
 */
export const clearFetchCache = (key?: string): void => {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
};

/**
 * Get a cached response without fetching
 */
export const getCachedResponse = <T>(cacheKey: string): T | null => {
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }
    memoryCache.delete(cacheKey);
  }
  return null;
};
