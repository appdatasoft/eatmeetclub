
/**
 * Enhanced Fetch Client with optimized performance
 */

import { createSessionCache } from "@/utils/fetch/sessionStorageCache";
import { supabase } from "@/integrations/supabase/client";

export interface FetchClientOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  cache?: RequestCache;
  cacheTime?: number; // Time in ms to cache the response
  retries?: number; // Number of retry attempts
  retryDelay?: number; // Base delay between retries in ms
  timeout?: number; // Request timeout in ms
  fallbackToSupabase?: boolean; // Whether to try Supabase as fallback
  supabseFallbackFn?: () => Promise<any>; // Function to call Supabase as fallback
  background?: boolean; // Whether to refresh data in the background
  signal?: AbortSignal; // AbortSignal to cancel the request
}

export interface FetchResponse<T = any> {
  data: T | null;
  error: Error | null;
  status?: number;
  headers?: Headers;
}

// Cache for responses
const responseCache = new Map<string, { data: any, expires: number }>();

// In-flight requests tracker to prevent duplicate requests
const inFlightRequests = new Map<string, Promise<FetchResponse<any>>>();

// Generate a cache key from request details
const getCacheKey = (url: string, options: FetchClientOptions = {}): string => {
  const { method = 'GET', body } = options;
  const bodyStr = body ? JSON.stringify(body) : '{}';
  return `${method}:${url}:${bodyStr}`;
};

// Prefetch data to improve perceived performance
export const prefetch = (url: string, options: FetchClientOptions = {}): void => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 8000); // 8 second timeout
  
  fetchClient(url, { 
    ...options, 
    signal: controller.signal,
    // Remove the priority option as it's not supported in our interface
  }).catch(() => {
    // Silently ignore prefetch errors
  });
};

// Clear cache for a specific key or all cache if no key provided
export const clearCache = (key?: string): void => {
  if (key) {
    responseCache.delete(key);
  } else {
    responseCache.clear();
  }
};

// Main fetch client function with optimized retry logic and caching
export const fetchClient = async <T = any>(
  url: string,
  options: FetchClientOptions = {}
): Promise<FetchResponse<T>> => {
  const {
    method = 'GET',
    headers = {},
    body,
    credentials = 'same-origin',
    mode = 'cors',
    cache = 'no-cache',
    cacheTime = 60000, // Default 1 minute cache
    retries = 2,
    retryDelay = 800,
    timeout = 10000, // 10 second timeout
    fallbackToSupabase = false,
    supabseFallbackFn,
    signal,
  } = options;

  // Create cache key for this request
  const cacheKey = getCacheKey(url, options);
  
  // Check if we already have a request in flight for this URL
  // This prevents duplicate requests for the same resource
  if (method === 'GET' && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<FetchResponse<T>>;
  }
  
  // Use session storage for more persistent caching
  if (method === 'GET' && cacheTime > 0) {
    const sessionCache = createSessionCache<T>(cacheKey, cacheTime);
    const cachedData = sessionCache.get();
    if (cachedData) {
      // If the request is in background mode and cache is stale,
      // trigger a refresh in the background
      if (options.background && sessionCache.isStale()) {
        setTimeout(() => {
          // Clone options but remove background flag to avoid infinite loop
          const refreshOptions = { ...options, background: false };
          fetchClient(url, refreshOptions).catch(() => {
            // Silently ignore background refresh errors
          });
        }, 100);
      }
      return { data: cachedData, error: null };
    }
  }
  
  // Prepare request headers
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type') && body && typeof body === 'object') {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  // Prepare request options
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials,
    mode,
    cache,
    signal,
  };

  // Add body if present
  if (body) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Create the fetch promise with retry logic
  const fetchPromise = (async () => {
    let attemptCount = 0;
    let lastError: any = null;

    while (attemptCount <= retries) {
      try {
        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Use user-provided signal if available, otherwise use our timeout controller
        const finalSignal = signal || controller.signal;
        
        // Execute fetch with timeout
        const response = await fetch(url, {
          ...fetchOptions,
          signal: finalSignal
        });
        
        // Clear timeout
        clearTimeout(timeoutId);

        // Handle response
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse response
        let data: T;
        try {
          data = await response.json();
        } catch (e) {
          // If not JSON, try to get text
          const text = await response.text();
          data = text as unknown as T;
        }

        // Cache successful response
        if (method === 'GET' && cacheTime > 0) {
          const sessionCache = createSessionCache<T>(cacheKey, cacheTime);
          sessionCache.set(data);
        }

        return {
          data,
          error: null,
          status: response.status,
          headers: response.headers
        };
      } catch (error: any) {
        lastError = error;
        attemptCount++;

        // Check if it's a timeout or abort error
        if (error.name === 'AbortError') {
          console.error(`Request to ${url} timed out`);
          break; // Don't retry timeouts
        }
        
        // Exit retry loop if we've reached max retries
        if (attemptCount > retries) {
          // Try fallback to Supabase if configured
          if (fallbackToSupabase && supabseFallbackFn) {
            try {
              console.log(`Falling back to Supabase for ${url}`);
              const data = await supabseFallbackFn();
              
              // Cache successful fallback response
              if (method === 'GET' && cacheTime > 0) {
                const sessionCache = createSessionCache<T>(cacheKey, cacheTime);
                sessionCache.set(data);
              }
              
              return { data, error: null };
            } catch (fallbackError: any) {
              console.error(`Supabase fallback failed for ${url}:`, fallbackError);
              return {
                data: null,
                error: new Error(`Fetch and fallback failed: ${fallbackError.message}`)
              };
            }
          }
          break;
        }

        // Wait before retry with exponential backoff and jitter
        const delay = retryDelay * Math.pow(1.5, attemptCount - 1) * (0.5 + Math.random() * 0.5);
        console.log(`Retrying ${url} (${attemptCount}/${retries}) after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      data: null,
      error: lastError || new Error('Request failed'),
    };
  })();
  
  // Store the in-flight request
  if (method === 'GET') {
    inFlightRequests.set(cacheKey, fetchPromise);
    
    // Clean up the in-flight request map after the request completes
    fetchPromise.finally(() => {
      inFlightRequests.delete(cacheKey);
    });
  }
  
  return fetchPromise;
};

// Helper methods for common HTTP verbs
export const get = <T = any>(url: string, options: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
  return fetchClient<T>(url, { ...options, method: 'GET' });
};

export const post = <T = any>(url: string, data: any, options: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
  return fetchClient<T>(url, { ...options, method: 'POST', body: data });
};

export const put = <T = any>(url: string, data: any, options: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
  return fetchClient<T>(url, { ...options, method: 'PUT', body: data });
};

export const patch = <T = any>(url: string, data: any, options: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
  return fetchClient<T>(url, { ...options, method: 'PATCH', body: data });
};

export const del = <T = any>(url: string, options: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
  return fetchClient<T>(url, { ...options, method: 'DELETE' });
};
