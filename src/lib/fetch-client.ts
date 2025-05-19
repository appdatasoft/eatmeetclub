
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
  cacheTime?: number;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  fallbackToSupabase?: boolean;
  supabseFallbackFn?: () => Promise<any>;
  background?: boolean;
  signal?: AbortSignal;
}

export interface FetchResponse<T = any> {
  data: T | null;
  error: Error | null;
  status?: number;
  headers?: Headers;
}

// Add interface for ContractTemplate
export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  type: string;
  variables: any[];
  version?: string;
  is_active?: boolean;
  updated_at?: string;
  created_at?: string;
}

const responseCache = new Map<string, { data: any, expires: number }>();
const inFlightRequests = new Map<string, Promise<FetchResponse<any>>>();

const getCacheKey = (url: string, options: FetchClientOptions = {}): string => {
  const { method = 'GET', body } = options;
  const bodyStr = body ? JSON.stringify(body) : '{}';
  return `${method}:${url}:${bodyStr}`;
};

export const prefetch = (url: string, options: FetchClientOptions = {}): void => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 8000);

  fetchClient(url, { ...options, signal: controller.signal }).catch(() => {});
};

export const clearCache = (key?: string): void => {
  if (key) {
    responseCache.delete(key);
  } else {
    responseCache.clear();
  }
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

// New methods for template operations
export const templates = {
  getAll: <T = ContractTemplate[]>(type: "restaurant" | "restaurant_referral" | "ticket_sales", customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return get<T>(`/api/templates/${type}`, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { data, error } = await supabase
          .from('contract_templates')
          .select('*')
          .eq('type', type);
        
        if (error) throw error;
        return data;
      }
    });
  },
  
  get: <T = ContractTemplate>(id: string, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return get<T>(`/api/templates/${id}`, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { data, error } = await supabase
          .from('contract_templates')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      }
    });
  },
  
  create: <T = ContractTemplate>(template: Partial<ContractTemplate>, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return post<T>('/api/templates', template, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { data, error } = await supabase
          .from('contract_templates')
          .insert(template)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    });
  },
  
  update: <T = ContractTemplate>(id: string, template: Partial<ContractTemplate>, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return put<T>(`/api/templates/${id}`, template, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { data, error } = await supabase
          .from('contract_templates')
          .update(template)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    });
  },
  
  delete: <T = any>(id: string, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return del<T>(`/api/templates/${id}`, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { error } = await supabase
          .from('contract_templates')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return { success: true };
      }
    });
  }
};
