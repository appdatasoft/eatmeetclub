
/**
 * Cache utilities for fetch client
 */

// Caching mechanisms
const responseCache = new Map<string, { data: any, expires: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

export const getCacheKey = (url: string, options: Record<string, any> = {}): string => {
  const { method = 'GET', body } = options;
  const bodyStr = body ? JSON.stringify(body) : '{}';
  return `${method}:${url}:${bodyStr}`;
};

export const clearCache = (key?: string): void => {
  if (key) {
    responseCache.delete(key);
  } else {
    responseCache.clear();
  }
};

export { responseCache, inFlightRequests };
