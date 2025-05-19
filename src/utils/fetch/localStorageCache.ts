
/**
 * Local storage based persistent cache implementation
 * This is useful for offline support and reducing API calls
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
  stale?: boolean;
  version: number;
}

interface OfflineCache<T = any> {
  set: (data: T, ttlMs?: number) => void;
  get: () => T | null;
  isStale: () => boolean;
  remove: () => void;
  clear: () => void;
}

// Current cache version to handle schema changes
const CACHE_VERSION = 1;

export const createOfflineCache = <T = any>(
  cacheKey: string,
  defaultTtl: number = 24 * 60 * 60 * 1000, // 24 hours by default
  options?: { staleWhileRevalidate?: boolean, prefix?: string }
): OfflineCache<T> => {
  const prefix = options?.prefix || 'app_cache:';
  const fullKey = `${prefix}${cacheKey}`;
  
  const set = (data: T, ttlMs: number = defaultTtl): void => {
    try {
      const entry: CacheEntry<T> = {
        data,
        expiry: Date.now() + ttlMs,
        stale: false,
        version: CACHE_VERSION
      };
      
      // Store in localStorage
      try {
        localStorage.setItem(fullKey, JSON.stringify(entry));
      } catch (e) {
        console.warn('Failed to store in localStorage:', e);
        
        // If storage quota is exceeded, clear old caches
        if (e instanceof DOMException && 
            (e.name === 'QuotaExceededError' || 
             e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          clearOldCaches(prefix);
          
          // Try again after clearing
          try {
            localStorage.setItem(fullKey, JSON.stringify(entry));
          } catch (retryError) {
            console.error('Still failed to store in localStorage after clearing old caches:', retryError);
          }
        }
      }
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };
  
  const get = (): T | null => {
    try {
      // Try localStorage
      const storedEntry = localStorage.getItem(fullKey);
      if (storedEntry) {
        const entry = JSON.parse(storedEntry) as CacheEntry<T>;
        
        // Ignore entries from different cache versions
        if (entry.version !== CACHE_VERSION) {
          remove();
          return null;
        }
        
        if (entry.expiry > Date.now()) {
          return entry.data;
        } else if (options?.staleWhileRevalidate) {
          // Mark as stale but return data anyway
          entry.stale = true;
          try {
            localStorage.setItem(fullKey, JSON.stringify(entry));
          } catch (e) {
            // Ignore storage errors
          }
          return entry.data;
        } else {
          // Expired
          remove();
        }
      }
    } catch (error) {
      console.error('Error getting from cache:', error);
      remove(); // Clean up potentially corrupted data
    }
    
    return null;
  };
  
  const isStale = (): boolean => {
    try {
      const storedEntry = localStorage.getItem(fullKey);
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
    try {
      localStorage.removeItem(fullKey);
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  const clear = (): void => {
    try {
      // Only clear keys with our prefix
      clearOldCaches(prefix);
    } catch (e) {
      console.warn('Error clearing localStorage cache:', e);
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

// Helper function to clear old caches
function clearOldCaches(prefix: string): void {
  const keys = [];
  
  // First collect all keys to avoid modification during iteration
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  
  // Sort keys by expiry date (if possible)
  const keyData = keys.map(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return {
        key,
        expiry: data.expiry || 0
      };
    } catch (e) {
      return {
        key,
        expiry: 0
      };
    }
  });
  
  // Sort by expiry (oldest first)
  keyData.sort((a, b) => a.expiry - b.expiry);
  
  // Remove oldest 50% of caches
  const toRemove = Math.ceil(keyData.length / 2);
  keyData.slice(0, toRemove).forEach(item => {
    try {
      localStorage.removeItem(item.key);
    } catch (e) {
      // Ignore errors
    }
  });
}
