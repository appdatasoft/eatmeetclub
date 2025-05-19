
/**
 * Simple cache implementation using sessionStorage
 * This is useful for caching API responses that don't change often
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
  staleAt?: number; // Optional timestamp for when data becomes stale but still usable
}

interface CacheOptions {
  staleWhileRevalidate?: boolean;
  staleTime?: number; // Time in ms before data is considered stale but still usable
}

/**
 * Creates a cache object that stores data in sessionStorage
 * @param key The cache key
 * @param ttl Time to live in milliseconds
 * @param options Additional cache configuration options
 */
export const createSessionCache = <T>(key: string, ttl: number = 5 * 60 * 1000, options?: CacheOptions) => {
  const staleTime = options?.staleTime || Math.floor(ttl * 0.5); // Default stale time is half of TTL
  
  return {
    /**
     * Get data from cache
     */
    get: (): T | null => {
      try {
        const cached = sessionStorage.getItem(key);
        if (!cached) return null;
        
        const item: CacheItem<T> = JSON.parse(cached);
        
        if (item.expiry < Date.now()) {
          sessionStorage.removeItem(key);
          return null;
        }
        
        return item.data;
      } catch (error) {
        console.error(`Error reading from cache: ${key}`, error);
        return null;
      }
    },
    
    /**
     * Set data in cache
     */
    set: (data: T): void => {
      try {
        const now = Date.now();
        const item: CacheItem<T> = {
          data,
          expiry: now + ttl,
          staleAt: options?.staleWhileRevalidate ? now + staleTime : undefined
        };
        
        sessionStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.error(`Error writing to cache: ${key}`, error);
      }
    },
    
    /**
     * Remove data from cache
     */
    remove: (): void => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing from cache: ${key}`, error);
      }
    },
    
    /**
     * Update TTL of existing cached data
     */
    refresh: (): boolean => {
      try {
        const cached = sessionStorage.getItem(key);
        if (!cached) return false;
        
        const item: CacheItem<T> = JSON.parse(cached);
        item.expiry = Date.now() + ttl;
        
        if (options?.staleWhileRevalidate) {
          item.staleAt = Date.now() + staleTime;
        }
        
        sessionStorage.setItem(key, JSON.stringify(item));
        return true;
      } catch (error) {
        console.error(`Error refreshing cache: ${key}`, error);
        return false;
      }
    },
    
    /**
     * Check if data is stale (but not expired)
     */
    isStale: (): boolean => {
      try {
        if (!options?.staleWhileRevalidate) return false;
        
        const cached = sessionStorage.getItem(key);
        if (!cached) return false;
        
        const item: CacheItem<T> = JSON.parse(cached);
        return !!item.staleAt && item.staleAt < Date.now() && item.expiry > Date.now();
      } catch (error) {
        console.error(`Error checking stale status: ${key}`, error);
        return false;
      }
    }
  };
};
