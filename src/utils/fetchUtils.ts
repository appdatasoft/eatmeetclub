
import { handleResponse, createResponseFromCachedData } from '@/integrations/supabase/utils/responseUtils';
import { requestTracker } from '@/utils/fetch/requestTracker';
import { createSessionCache } from './fetch/sessionStorageCache';

export interface FetchRetryOptions {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
  cacheKey?: string;
  cacheTTL?: number;
  staleWhileRevalidate?: boolean;
}

/**
 * Utility for fetching data with retry logic and safe response handling
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: FetchRetryOptions = {}
): Promise<T> => {
  const {
    retries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000 // 5 minutes default cache TTL
  } = options;

  // Check cache first if cacheKey is provided
  if (cacheKey) {
    const cache = createSessionCache<T>(
      cacheKey,
      cacheTTL,
      { staleWhileRevalidate: options.staleWhileRevalidate }
    );
    const cachedResult = cache.get();
    
    if (cachedResult) {
      console.log(`Cache hit for key: ${cacheKey}`);
      
      // If cache is stale, refresh in background
      if (cache.isStale() && options.staleWhileRevalidate) {
        console.log(`Stale cache for key: ${cacheKey}, refreshing in background`);
        setTimeout(() => {
          refreshDataInBackground(fetchFn, cache);
        }, 10);
      }
      
      return cachedResult;
    }
  }

  let attempt = 0;
  let lastError = null;
  
  while (attempt <= retries) {
    try {
      // Wait for request throttling
      await requestTracker.checkAndWait();
      
      // Execute the fetch function
      const result = await fetchFn();
      
      // Release the request slot
      requestTracker.releaseRequest();
      
      // Store in cache if successful and cacheKey is provided
      if (cacheKey) {
        const cache = createSessionCache<T>(
          cacheKey, 
          cacheTTL,
          { staleWhileRevalidate: options.staleWhileRevalidate }
        );
        cache.set(result);
      }
      
      return result;
    } catch (error: any) {
      // Release the request slot even on error
      requestTracker.releaseRequest();
      
      lastError = error;
      attempt++;
      
      // Check if we should retry this error
      if (!shouldRetry(error) || attempt > retries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const jitter = Math.random() * 500; // Add randomness
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + jitter,
        maxDelay
      );
      
      console.log(`Retry attempt ${attempt}/${retries} after ${delay}ms`);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Background refresh function to update cache without blocking UI
async function refreshDataInBackground<T>(
  fetchFn: () => Promise<T>,
  cache: ReturnType<typeof createSessionCache<T>>
): Promise<void> {
  try {
    const result = await fetchFn();
    cache.set(result);
    console.log(`Background refresh complete`);
  } catch (error) {
    console.error(`Background refresh failed`, error);
  }
}

/**
 * Enhanced version of fetchWithRetry for HTTP requests with streaming protection
 */
export const fetchWithCache = async (
  url: string, 
  options: RequestInit = {},
  cacheKey?: string, 
  cacheDuration: number = 60000
): Promise<Response> => {
  // Create cache key from URL and request options
  const effectiveCacheKey = cacheKey || `${url}-${JSON.stringify(options)}`;
  
  // Check session storage cache first for GET requests
  if (options.method === 'GET' || !options.method) {
    const cache = createSessionCache<any>(
      effectiveCacheKey,
      cacheDuration,
      { staleWhileRevalidate: true }
    );
    const cachedData = cache.get();
    
    if (cachedData) {
      console.log(`Using cached response for: ${url}`);
      // Create a new response from cached data
      return createResponseFromCachedData(cachedData);
    }
  }

  // Perform the actual fetch with proper cloning
  const response = await fetch(url, options);
  
  // IMPORTANT: Clone the response before any processing to prevent "body stream already read" errors
  const clonedResponse = response.clone();
  
  // Cache successful GET responses
  if (response.ok && (options.method === 'GET' || !options.method)) {
    try {
      // Create another clone for caching to avoid reading the original response
      const dataResponse = response.clone();
      // Read the data and store it in cache
      const data = await dataResponse.json();
      
      const cache = createSessionCache<any>(
        effectiveCacheKey,
        cacheDuration,
        { staleWhileRevalidate: true }
      );
      cache.set(data);
    } catch (e) {
      console.warn('Error caching response:', e);
    }
  }
  
  // Return the cloned response which can still be read
  return clonedResponse;
};
