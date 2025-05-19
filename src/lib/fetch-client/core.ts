
/**
 * Core fetch client functionality
 */

import { createSessionCache } from "@/utils/fetch/sessionStorageCache";
import { FetchClientOptions, FetchResponse } from "./types";
import { getCacheKey, responseCache, inFlightRequests } from "./cache";

export const prefetch = (url: string, options: FetchClientOptions = {}): void => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 8000);

  fetchClient(url, { ...options, signal: controller.signal }).catch(() => {});
};

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
    cacheTime = 60000,
    retries = 2,
    retryDelay = 800,
    timeout = 10000,
    fallbackToSupabase = false,
    supabseFallbackFn,
    signal,
  } = options;

  const cacheKey = getCacheKey(url, options);

  if (method === 'GET' && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<FetchResponse<T>>;
  }

  if (method === 'GET' && cacheTime > 0) {
    const sessionCache = createSessionCache<T>(cacheKey, cacheTime);
    const cachedData = sessionCache.get();
    if (cachedData) {
      if (options.background && sessionCache.isStale()) {
        setTimeout(() => {
          const refreshOptions = { ...options, background: false };
          fetchClient(url, refreshOptions).catch(() => {});
        }, 100);
      }
      return { data: cachedData, error: null };
    }
  }

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type') && body && typeof body === 'object') {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials,
    mode,
    cache,
    signal,
  };

  if (body) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const fetchPromise = (async () => {
    let attemptCount = 0;
    let lastError: any = null;

    while (attemptCount <= retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const finalSignal = signal || controller.signal;

        const response = await fetch(url, {
          ...fetchOptions,
          signal: finalSignal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorClone = response.clone();
          const errorText = await errorClone.text().catch(() => '');
          throw new Error(`HTTP error ${response.status}: ${errorText || response.statusText}`);
        }

        const cloned = response.clone();
        let data: T;
        try {
          data = await cloned.json();
        } catch {
          try {
            const text = await cloned.text();
            data = text as unknown as T;
          } catch (e) {
            throw new Error('Failed to parse response body');
          }
        }

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

        if (error.name === 'AbortError') {
          console.error(`Request to ${url} timed out`);
          break;
        }

        if (attemptCount > retries) {
          if (fallbackToSupabase && supabseFallbackFn) {
            try {
              console.log(`Falling back to Supabase for ${url}`);
              const data = await supabseFallbackFn();

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

  if (method === 'GET') {
    inFlightRequests.set(cacheKey, fetchPromise);
    fetchPromise.finally(() => {
      inFlightRequests.delete(cacheKey);
    });
  }

  return fetchPromise;
};

// HTTP method wrappers
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
