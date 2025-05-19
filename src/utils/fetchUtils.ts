
import { handleResponse } from '@/integrations/supabase/utils/responseUtils';
import { requestQueue } from '@/integrations/supabase/utils/requestQueue';
import { createSessionCache } from './fetch/sessionStorageCache';

export interface FetchRetryOptions {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

// Create a request cache
const requestCache = createSessionCache();

/**
 * Utility for fetching data with retry logic and safe response handling
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<{ data: T | null; error: any }>,
  options: FetchRetryOptions = {}
): Promise<{ data: T | null; error: any }> => {
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
    const cachedResult = requestCache.get<{ data: T | null; error: any }>(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }
  }

  let attempt = 0;
  let lastError = null;
  
  while (attempt <= retries) {
    try {
      // Use request queue to throttle requests
      const result = await requestQueue.add(async () => {
        // Execute the fetch function
        const response = await fetchFn();
        
        // If there's data, create a safe deep clone
        if (response.data) {
          try {
            // Deep clone the data to ensure it can be read multiple times
            const safeClone = JSON.parse(JSON.stringify(response.data));
            return { data: safeClone, error: null };
          } catch (cloneError) {
            console.warn('Error cloning response data:', cloneError);
            // If cloning fails, return the original result
            return response;
          }
        }
        
        return response;
      }, `fetchWithRetry-${attempt}`);
      
      // Store in cache if successful and cacheKey is provided
      if (cacheKey && result.data) {
        requestCache.set(cacheKey, result, cacheTTL);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Check if we should retry this error
      if (!shouldRetry(error) || attempt >= retries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      console.log(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }

  return { data: null, error: lastError };
};

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
    try {
      const cached = sessionStorage.getItem(effectiveCacheKey);
      if (cached) {
        const { data, expiry } = JSON.parse(cached);
        if (expiry > Date.now()) {
          console.log(`Using cached response for: ${url}`);
          // Create a new response from cached data
          return new Response(new Blob([JSON.stringify(data)], {
            type: 'application/json'
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          });
        } else {
          sessionStorage.removeItem(effectiveCacheKey);
        }
      }
    } catch (e) {
      console.warn('Cache access error:', e);
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
      
      sessionStorage.setItem(effectiveCacheKey, JSON.stringify({
        data,
        expiry: Date.now() + cacheDuration
      }));
    } catch (e) {
      console.warn('Error caching response:', e);
    }
  }
  
  // Return the cloned response which can still be read
  return clonedResponse;
};
