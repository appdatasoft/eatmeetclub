
import { handleResponse } from '@/integrations/supabase/utils/responseUtils';
import { requestQueue } from '@/integrations/supabase/utils/requestQueue';

export interface FetchRetryOptions {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Utility for fetching data with retry logic
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<{ data: T | null; error: any }>,
  options: FetchRetryOptions = {}
): Promise<{ data: T | null; error: any }> => {
  const {
    retries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true
  } = options;

  let attempt = 0;
  let lastError = null;
  
  while (attempt <= retries) {
    try {
      // Use request queue to throttle requests
      return await requestQueue.add(async () => {
        return await fetchFn();
      }, `fetchWithRetry-${attempt}`);
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
 * Enhanced version of fetchWithRetry for HTTP requests
 */
export const fetchWithCache = async (
  url: string, 
  options: RequestInit = {},
  cacheKey?: string, 
  cacheDuration: number = 60000
): Promise<Response> => {
  // Create cache key from URL and request options
  const effectiveCacheKey = cacheKey || `${url}-${JSON.stringify(options)}`;
  
  // Check session storage cache first
  if (options.method === 'GET' || !options.method) {
    try {
      const cached = sessionStorage.getItem(effectiveCacheKey);
      if (cached) {
        const { data, expiry } = JSON.parse(cached);
        if (expiry > Date.now()) {
          console.log(`Using cached response for: ${url}`);
          return new Response(JSON.stringify(data), {
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
  const clonedResponse = response.clone();
  
  // Cache successful GET responses
  if (response.ok && (options.method === 'GET' || !options.method)) {
    try {
      const data = await clonedResponse.clone().json();
      sessionStorage.setItem(effectiveCacheKey, JSON.stringify({
        data,
        expiry: Date.now() + cacheDuration
      }));
    } catch (e) {
      console.warn('Error caching response:', e);
    }
  }
  
  return clonedResponse;
};
