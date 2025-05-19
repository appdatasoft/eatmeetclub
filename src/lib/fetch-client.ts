
/**
 * Enhanced fetch client with performance optimization, caching, and retry logic
 */

import { createSessionCache } from '@/utils/fetch/sessionStorageCache';

// Configuration types
export interface FetchClientOptions extends RequestInit {
  retries?: number;
  cacheTime?: number; // in ms
  staleTime?: number; // in ms
  disableCache?: boolean;
  cachePriority?: 'memory' | 'storage' | 'both';
  background?: boolean; // fetch in background without blocking UI
  dedupe?: boolean; // deduplicate requests (default: true)
  retryDelay?: number; // base delay in ms before retrying
  maxDelay?: number; // max delay for exponential backoff
}

// Response types
export interface FetchResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
  statusText: string;
  headers: Headers;
  isCached: boolean;
  isStale: boolean;
}

// Memory cache implementation
const memoryCache = new Map<string, {
  data: any;
  expiry: number; // absolute expiry time
  staleAt: number; // when the data becomes stale but still usable
  timestamp: number; // when the data was cached
}>();

// Request deduplication registry
const pendingRequests = new Map<string, Promise<FetchResponse<any>>>();

// Configuration constants
const DEFAULT_RETRY_DELAY = 800; // ms
const DEFAULT_MAX_DELAY = 8000; // ms
const DEFAULT_CACHE_TIME = 60 * 1000; // 1 minute
const DEFAULT_STALE_TIME = 30 * 1000; // 30 seconds

/**
 * Enhanced fetch client with caching, retries, and performance optimization
 */
export async function fetchClient<T = any>(
  url: string, 
  options: FetchClientOptions = {}
): Promise<FetchResponse<T>> {
  const {
    retries = 2,
    cacheTime = DEFAULT_CACHE_TIME,
    staleTime = DEFAULT_STALE_TIME,
    disableCache = false,
    cachePriority = 'both',
    background = false,
    dedupe = true,
    retryDelay = DEFAULT_RETRY_DELAY,
    maxDelay = DEFAULT_MAX_DELAY,
    ...fetchOptions
  } = options;

  // Create a unique cache key
  const method = fetchOptions.method?.toUpperCase() || 'GET';
  const cacheKey = `${method}:${url}:${JSON.stringify(fetchOptions.body || {})}`;

  // Only deduplicate GET requests or if explicitly requested
  if (dedupe && (method === 'GET' || options.dedupe)) {
    const existingRequest = pendingRequests.get(cacheKey);
    if (existingRequest) {
      return existingRequest;
    }
  }

  // Function to execute the actual fetch with retries
  const executeRequest = async (attemptsLeft: number, delay: number): Promise<FetchResponse<T>> => {
    try {
      console.log(`Fetching ${url} (${attemptsLeft} attempts left)`);
      
      // Add default headers if not provided
      const headers = new Headers(fetchOptions.headers || {});
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }
      
      if (method !== 'GET' && !headers.has('Content-Type') && fetchOptions.body) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        method,
      });

      let data: T | null = null;
      let error: Error | null = null;

      if (response.ok) {
        // Only try to parse if there's content
        if (response.status !== 204) { // No Content
          try {
            // Clone the response before reading to avoid "body already read" errors
            const contentType = response.headers.get('content-type') || '';
            
            if (contentType.includes('application/json')) {
              data = await response.clone().json();
            } else if (contentType.includes('text/')) {
              const text = await response.clone().text();
              // Try to parse as JSON if it looks like JSON
              if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                try {
                  data = JSON.parse(text) as T;
                } catch {
                  data = text as unknown as T;
                }
              } else {
                data = text as unknown as T;
              }
            } else {
              // For other content types, just store response
              data = { response } as unknown as T;
            }
          } catch (err) {
            console.error('Error parsing response:', err);
            error = new Error(`Failed to parse response: ${(err as Error).message}`);
          }
        }
      } else {
        // Handle error response
        let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await response.clone().json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const errorText = await response.clone().text();
            if (errorText) errorMessage += ` - ${errorText}`;
          }
        } catch {
          // If we can't parse the error, use the status text
        }
        
        error = new Error(errorMessage);
      }

      const result: FetchResponse<T> = {
        data,
        error,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        isCached: false,
        isStale: false
      };

      // For successful responses, update cache (if enabled and it's a GET request)
      if (response.ok && !disableCache && method === 'GET') {
        const now = Date.now();
        
        // Update memory cache
        if (cachePriority === 'memory' || cachePriority === 'both') {
          memoryCache.set(cacheKey, {
            data,
            expiry: now + cacheTime,
            staleAt: now + staleTime,
            timestamp: now
          });
        }
        
        // Update session storage cache
        if (cachePriority === 'storage' || cachePriority === 'both') {
          const storageCache = createSessionCache<T>(cacheKey, cacheTime, {
            staleWhileRevalidate: true
          });
          storageCache.set(data as T);
        }
      }

      return result;
    } catch (err) {
      // For network or other errors, retry if we have attempts left
      if (attemptsLeft > 0) {
        console.warn(`Request to ${url} failed, retrying in ${delay}ms...`, err);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Exponential backoff with jitter
        const nextDelay = Math.min(delay * 1.5 * (0.9 + Math.random() * 0.2), maxDelay);
        return executeRequest(attemptsLeft - 1, nextDelay);
      }
      
      // No attempts left, propagate the error
      return {
        data: null,
        error: err instanceof Error ? err : new Error(String(err)),
        status: 0,
        statusText: 'Network Error',
        headers: new Headers(),
        isCached: false,
        isStale: false
      };
    }
  };

  // Function to check cache and execute the request if needed
  const fetchWithCache = async (): Promise<FetchResponse<T>> => {
    // Only use cache for GET requests
    if (method !== 'GET' || disableCache) {
      return executeRequest(retries, retryDelay);
    }

    // Check memory cache first (faster)
    if (cachePriority === 'memory' || cachePriority === 'both') {
      const cached = memoryCache.get(cacheKey);
      const now = Date.now();
      
      if (cached) {
        // If data is not expired, return it
        if (cached.expiry >= now) {
          console.log(`Using memory cached data for ${url}`);
          return {
            data: cached.data,
            error: null,
            status: 200,
            statusText: 'OK (from cache)',
            headers: new Headers(),
            isCached: true,
            isStale: cached.staleAt < now
          };
        }
        
        // If data is stale but we can use it temporarily
        if (cached.staleAt < now && cached.expiry >= now) {
          // If background refresh is enabled, trigger a refresh
          if (background) {
            console.log(`Using stale data for ${url}, refreshing in background`);
            // Don't await, let it run in background
            setTimeout(() => {
              executeRequest(retries, 0).then(freshResult => {
                // Update cache with fresh data
                if (freshResult.data && !freshResult.error) {
                  memoryCache.set(cacheKey, {
                    data: freshResult.data,
                    expiry: Date.now() + cacheTime,
                    staleAt: Date.now() + staleTime,
                    timestamp: Date.now()
                  });
                }
              }).catch(() => {
                // Silently fail for background refreshes
              });
            }, 0);
          }
          
          return {
            data: cached.data,
            error: null,
            status: 200,
            statusText: 'OK (from stale cache)',
            headers: new Headers(),
            isCached: true,
            isStale: true
          };
        }
        
        // If expired, remove from cache
        memoryCache.delete(cacheKey);
      }
    }
    
    // Check session storage cache if enabled
    if (cachePriority === 'storage' || cachePriority === 'both') {
      const storageCache = createSessionCache<T>(cacheKey, cacheTime, {
        staleWhileRevalidate: true
      });
      
      const cachedData = storageCache.get();
      if (cachedData) {
        console.log(`Using storage cached data for ${url}`);
        
        const isStale = storageCache.isStale();
        
        // If stale and background refresh enabled, update in background
        if (isStale && background) {
          console.log(`Data is stale, refreshing in background`);
          setTimeout(() => {
            executeRequest(retries, 0).then(freshResult => {
              if (freshResult.data && !freshResult.error) {
                storageCache.set(freshResult.data);
              }
            }).catch(() => {
              // Silently fail for background refreshes
            });
          }, 0);
        }
        
        return {
          data: cachedData,
          error: null,
          status: 200, 
          statusText: isStale ? 'OK (from stale storage cache)' : 'OK (from storage cache)',
          headers: new Headers(),
          isCached: true,
          isStale
        };
      }
    }
    
    // No cache hit, execute the request
    return executeRequest(retries, retryDelay);
  };

  // Create the promise for this request
  const requestPromise = fetchWithCache();
  
  // Store in pending requests map for deduplication
  if (dedupe) {
    pendingRequests.set(cacheKey, requestPromise);
    // Remove from pending after completion
    requestPromise.finally(() => {
      pendingRequests.delete(cacheKey);
    });
  }
  
  return requestPromise;
}

/**
 * Clear all caches or specific cache entries
 */
export function clearCache(key?: string): void {
  if (key) {
    // Clear specific cache entry
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(`app_cache_${key}`);
    } catch (e) {
      console.warn('Failed to clear session storage cache', e);
    }
  } else {
    // Clear all caches
    memoryCache.clear();
    try {
      // Clear all session storage caches with our prefix
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('app_cache_')) {
          sessionStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.warn('Failed to clear all session storage caches', e);
    }
  }
}

/**
 * GET convenience method
 */
export async function get<T = any>(
  url: string,
  options: Omit<FetchClientOptions, 'method'> = {}
): Promise<FetchResponse<T>> {
  return fetchClient<T>(url, { ...options, method: 'GET' });
}

/**
 * POST convenience method
 */
export async function post<T = any>(
  url: string,
  data: any,
  options: Omit<FetchClientOptions, 'method' | 'body'> = {}
): Promise<FetchResponse<T>> {
  return fetchClient<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}

/**
 * PUT convenience method
 */
export async function put<T = any>(
  url: string,
  data: any,
  options: Omit<FetchClientOptions, 'method' | 'body'> = {}
): Promise<FetchResponse<T>> {
  return fetchClient<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}

/**
 * DELETE convenience method
 */
export async function del<T = any>(
  url: string,
  options: Omit<FetchClientOptions, 'method'> = {}
): Promise<FetchResponse<T>> {
  return fetchClient<T>(url, { ...options, method: 'DELETE' });
}

/**
 * PATCH convenience method
 */
export async function patch<T = any>(
  url: string,
  data: any,
  options: Omit<FetchClientOptions, 'method' | 'body'> = {}
): Promise<FetchResponse<T>> {
  return fetchClient<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}
