
/**
 * Persistent cache implementation using localStorage
 * This is useful for caching data that should persist between sessions
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

/**
 * Creates a cache object that stores data in localStorage with built-in expiry
 * @param key The cache key
 * @param ttl Time to live in milliseconds
 */
export const createOfflineCache = <T>(key: string, ttl: number = 24 * 60 * 60 * 1000) => {
  return {
    /**
     * Get data from cache
     */
    get: (): T | null => {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const item: CacheItem<T> = JSON.parse(cached);
        
        if (item.expiry < Date.now()) {
          localStorage.removeItem(key);
          return null;
        }
        
        return item.data;
      } catch (error) {
        console.error(`Error reading from offline cache: ${key}`, error);
        return null;
      }
    },
    
    /**
     * Set data in cache
     */
    set: (data: T): void => {
      try {
        const item: CacheItem<T> = {
          data,
          expiry: Date.now() + ttl
        };
        
        localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.error(`Error writing to offline cache: ${key}`, error);
      }
    },
    
    /**
     * Remove data from cache
     */
    remove: (): void => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing from offline cache: ${key}`, error);
      }
    },
    
    /**
     * Update TTL of existing cached data
     */
    refresh: (): boolean => {
      try {
        const cached = localStorage.getItem(key);
        if (!cached) return false;
        
        const item: CacheItem<T> = JSON.parse(cached);
        item.expiry = Date.now() + ttl;
        
        localStorage.setItem(key, JSON.stringify(item));
        return true;
      } catch (error) {
        console.error(`Error refreshing offline cache: ${key}`, error);
        return false;
      }
    }
  };
};
