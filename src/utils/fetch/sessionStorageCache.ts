
/**
 * Session storage based cache implementation
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
  stale?: boolean;
}

interface SessionCache<T = any> {
  set: (key: string, data: T, ttlMs?: number) => void;
  get: () => T | null;
  isStale: () => boolean;
  remove: () => void;
  clear: () => void;
}

export const createSessionCache = <T = any>(
  cacheKey: string,
  defaultTtl: number = 60000,
  options?: { staleWhileRevalidate?: boolean }
): SessionCache<T> => {
  const cache = new Map<string, CacheEntry<any>>();
  
  const set = (data: T, ttlMs: number = defaultTtl): void => {
    try {
      const entry: CacheEntry<T> = {
        data,
        expiry: Date.now() + ttlMs,
        stale: false
      };
      
      // Store in memory map
      cache.set(cacheKey, entry);
      
      // Also try to store in sessionStorage
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch (e) {
        console.warn('Failed to store in sessionStorage:', e);
      }
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };
  
  const get = (): T | null => {
    try {
      // Try memory cache first
      if (cache.has(cacheKey)) {
        const entry = cache.get(cacheKey) as CacheEntry<T>;
        if (entry.expiry > Date.now()) {
          return entry.data;
        } else if (options?.staleWhileRevalidate) {
          // Mark as stale but return data anyway
          entry.stale = true;
          return entry.data;
        } else {
          // Expired
          remove();
        }
      }
      
      // Try sessionStorage as fallback
      try {
        const storedEntry = sessionStorage.getItem(cacheKey);
        if (storedEntry) {
          const entry = JSON.parse(storedEntry) as CacheEntry<T>;
          if (entry.expiry > Date.now()) {
            // Restore to memory cache
            cache.set(cacheKey, entry);
            return entry.data;
          } else if (options?.staleWhileRevalidate) {
            // Mark as stale but return data anyway
            entry.stale = true;
            cache.set(cacheKey, entry);
            return entry.data;
          } else {
            // Expired
            remove();
          }
        }
      } catch (e) {
        console.warn('Error reading from sessionStorage:', e);
      }
    } catch (error) {
      console.error('Error getting from cache:', error);
    }
    
    return null;
  };
  
  const isStale = (): boolean => {
    try {
      if (cache.has(cacheKey)) {
        const entry = cache.get(cacheKey) as CacheEntry<T>;
        return !!entry.stale || entry.expiry <= Date.now();
      }
      
      // Check sessionStorage
      const storedEntry = sessionStorage.getItem(cacheKey);
      if (storedEntry) {
        const entry = JSON.parse(storedEntry) as CacheEntry<T>;
        return !!entry.stale || entry.expiry <= Date.now();
      }
    } catch (e) {
      console.warn('Error checking stale status:', e);
    }
    
    return true; // If we can't verify, assume it's stale
  };
  
  const remove = (): void => {
    cache.delete(cacheKey);
    try {
      sessionStorage.removeItem(cacheKey);
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  const clear = (): void => {
    cache.clear();
    try {
      // Only clear keys that belong to our cache, not everything in sessionStorage
      sessionStorage.removeItem(cacheKey);
      // Also clear any keys that start with our key (for pattern matching)
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(`${cacheKey}:`)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Error clearing sessionStorage cache:', e);
    }
  };
  
  return {
    set,
    get,
    isStale,
    remove,
    clear,
  };
};
