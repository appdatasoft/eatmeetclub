
interface CacheOptions {
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Create a session storage cache with optimized performance
 */
export function createSessionCache<T>(
  key: string, 
  ttlMs: number = 5 * 60 * 1000,
  options: CacheOptions = {}
) {
  const cacheKey = `cache_${key}`;
  
  // Get data from session storage
  const get = (): T | null => {
    try {
      const cachedJson = sessionStorage.getItem(cacheKey);
      if (!cachedJson) return null;
      
      const cached = JSON.parse(cachedJson) as CacheEntry<T>;
      const now = Date.now();
      
      // If cache has expired, mark it as stale
      if (now > cached.expiry) {
        // In staleWhileRevalidate mode, we still return expired data
        if (options.staleWhileRevalidate) {
          return cached.data;
        }
        remove(); // Clean up expired cache
        return null;
      }
      
      return cached.data;
    } catch (err) {
      console.error('Error reading from session cache:', err);
      return null;
    }
  };
  
  // Set data in session storage
  const set = (data: T): void => {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttlMs
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (err) {
      console.error('Error writing to session cache:', err);
      
      // If we hit storage quota limits, clear older caches
      if (err instanceof DOMException && 
          (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        clearOldCaches();
      }
    }
  };
  
  // Clear older cache entries to free up space
  const clearOldCaches = () => {
    try {
      // Get all cache keys
      const cachePrefix = 'cache_';
      const cacheKeys: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(cachePrefix)) {
          cacheKeys.push(key);
        }
      }
      
      // Sort by timestamp (if available)
      const sortedKeys = cacheKeys.sort((a, b) => {
        try {
          const aData = JSON.parse(sessionStorage.getItem(a) || '{}') as CacheEntry<any>;
          const bData = JSON.parse(sessionStorage.getItem(b) || '{}') as CacheEntry<any>;
          return (aData.timestamp || 0) - (bData.timestamp || 0);
        } catch {
          return 0;
        }
      });
      
      // Remove the oldest 20% of caches
      const removeCount = Math.ceil(sortedKeys.length * 0.2);
      sortedKeys.slice(0, removeCount).forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      console.log(`Cleared ${removeCount} old cache entries to free up space`);
    } catch (err) {
      console.error('Error clearing old caches:', err);
    }
  };
  
  // Remove this item from cache
  const remove = (): void => {
    sessionStorage.removeItem(cacheKey);
  };
  
  // Check if the cached data is stale (expired but still available)
  const isStale = (): boolean => {
    try {
      const cachedJson = sessionStorage.getItem(cacheKey);
      if (!cachedJson) return false;
      
      const cached = JSON.parse(cachedJson) as CacheEntry<T>;
      return Date.now() > cached.expiry;
    } catch {
      return false;
    }
  };
  
  // Update the expiry time without modifying the data
  const refresh = (): void => {
    try {
      const cachedJson = sessionStorage.getItem(cacheKey);
      if (!cachedJson) return;
      
      const cached = JSON.parse(cachedJson) as CacheEntry<T>;
      cached.expiry = Date.now() + ttlMs;
      
      sessionStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch {
      // Ignore refresh errors
    }
  };
  
  return {
    get,
    set,
    remove,
    isStale,
    refresh
  };
}
