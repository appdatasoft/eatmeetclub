
/**
 * Session storage based cache implementation
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export const createSessionCache = () => {
  const cache = new Map<string, CacheEntry<any>>();
  
  const set = <T>(key: string, data: T, ttlMs: number = 60000): void => {
    try {
      const entry: CacheEntry<T> = {
        data,
        expiry: Date.now() + ttlMs
      };
      
      // Store in memory map
      cache.set(key, entry);
      
      // Also try to store in sessionStorage
      try {
        sessionStorage.setItem(key, JSON.stringify(entry));
      } catch (e) {
        console.warn('Failed to store in sessionStorage:', e);
      }
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };
  
  const get = <T>(key: string): T | null => {
    try {
      // Try memory cache first
      if (cache.has(key)) {
        const entry = cache.get(key) as CacheEntry<T>;
        if (entry.expiry > Date.now()) {
          return entry.data;
        } else {
          // Expired
          cache.delete(key);
          try {
            sessionStorage.removeItem(key);
          } catch (e) {
            // Ignore storage errors
          }
        }
      }
      
      // Try sessionStorage as fallback
      try {
        const storedEntry = sessionStorage.getItem(key);
        if (storedEntry) {
          const entry = JSON.parse(storedEntry) as CacheEntry<T>;
          if (entry.expiry > Date.now()) {
            // Restore to memory cache
            cache.set(key, entry);
            return entry.data;
          } else {
            // Expired
            sessionStorage.removeItem(key);
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
  
  const remove = (key: string): void => {
    cache.delete(key);
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  const clear = (): void => {
    cache.clear();
    try {
      // Only clear keys that belong to our cache, not everything in sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache:')) {
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
    remove,
    clear,
  };
};
