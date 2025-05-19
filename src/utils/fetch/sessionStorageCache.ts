
/**
 * Enhanced session storage based cache with fallback to memory
 * Use this for caching API responses that might be needed across page refreshes
 */

interface CacheOptions {
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
  storagePrefix?: string; // Prefix for storage keys
  useLocalStorage?: boolean; // Use localStorage instead of sessionStorage
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
  timestamp: number;
}

export const createSessionCache = <T>(
  key: string, 
  ttl = 5 * 60 * 1000, // Default 5 minute TTL
  options: CacheOptions = {}
) => {
  const { 
    staleWhileRevalidate = false,
    storagePrefix = 'app_cache_',
    useLocalStorage = false
  } = options;
  
  // Use provided storage or fallback to memory-only if not available
  let storage: Storage;
  try {
    storage = useLocalStorage ? localStorage : sessionStorage;
    // Test if storage is accessible
    storage.setItem('storage_test', 'test');
    storage.removeItem('storage_test');
  } catch (e) {
    console.warn('Web Storage not available, using memory cache only');
    // Create an in-memory fallback storage
    const memoryStore = new Map<string, string>();
    storage = {
      getItem: (k: string) => memoryStore.get(k) || null,
      setItem: (k: string, v: string) => memoryStore.set(k, v),
      removeItem: (k: string) => memoryStore.delete(k),
      clear: () => memoryStore.clear(),
      key: () => null,
      length: 0
    };
  }
  
  const memoryCache = new Map<string, CacheEntry<T>>();
  const storageKey = `${storagePrefix}${key}`;
  
  // Helper function to safely parse JSON
  const safeJSONParse = (data: string | null): CacheEntry<T> | null => {
    if (!data) return null;
    try {
      return JSON.parse(data) as CacheEntry<T>;
    } catch (e) {
      console.warn(`Invalid JSON in cache: ${storageKey}`);
      return null;
    }
  };
  
  return {
    /**
     * Set data in the cache
     */
    set: (data: T): void => {
      try {
        const cacheEntry: CacheEntry<T> = {
          data,
          expiry: Date.now() + ttl,
          timestamp: Date.now()
        };
        
        // Set in memory first
        memoryCache.set(key, cacheEntry);
        
        // Try to set in storage
        try {
          storage.setItem(storageKey, JSON.stringify(cacheEntry));
        } catch (storageError) {
          console.warn('Failed to store in sessionStorage, using memory cache only:', storageError);
        }
      } catch (error) {
        console.error('Failed to set cache:', error);
      }
    },
    
    /**
     * Get data from the cache
     */
    get: (): T | null => {
      try {
        // Check memory cache first (faster)
        const memoryCachedItem = memoryCache.get(key);
        if (memoryCachedItem) {
          if (memoryCachedItem.expiry >= Date.now() || staleWhileRevalidate) {
            return memoryCachedItem.data;
          }
        }
        
        // Then try storage
        const storedItem = storage.getItem(storageKey);
        if (!storedItem) return null;
        
        const cachedItem = safeJSONParse(storedItem);
        if (!cachedItem) return null;
        
        // Update memory cache
        memoryCache.set(key, cachedItem);
        
        // Check if data is fresh
        if (cachedItem.expiry >= Date.now() || staleWhileRevalidate) {
          return cachedItem.data;
        }
        
        return null;
      } catch (error) {
        console.error('Error reading from cache:', error);
        return null;
      }
    },
    
    /**
     * Check if the cache is stale but still returning data
     */
    isStale: (): boolean => {
      try {
        // Check memory first
        const memoryCachedItem = memoryCache.get(key);
        if (memoryCachedItem) {
          return memoryCachedItem.expiry < Date.now();
        }
        
        // Then check storage
        const storedItem = storage.getItem(storageKey);
        if (!storedItem) return false;
        
        const cachedItem = safeJSONParse(storedItem);
        if (!cachedItem) return false;
        
        return cachedItem.expiry < Date.now();
      } catch (error) {
        console.error('Error checking cache staleness:', error);
        return false;
      }
    },
    
    /**
     * Remove an item from the cache
     */
    remove: (): void => {
      memoryCache.delete(key);
      try {
        storage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to remove item from storage:', error);
      }
    },
    
    /**
     * Clear all cache entries with the given prefix
     */
    clearAll: (prefix?: string): void => {
      // Clear memory cache for this key
      memoryCache.clear();
      
      // Clear all matching items in storage
      try {
        const fullPrefix = prefix ? `${storagePrefix}${prefix}` : storagePrefix;
        
        const keysToRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const storageItemKey = storage.key(i);
          if (storageItemKey && storageItemKey.startsWith(fullPrefix)) {
            keysToRemove.push(storageItemKey);
          }
        }
        
        keysToRemove.forEach(k => storage.removeItem(k));
      } catch (error) {
        console.warn('Failed to clear cache from storage:', error);
      }
    },

    /**
     * Refresh the expiry time of the cached item without changing the data
     */
    refresh: (): void => {
      try {
        // Get current cached data
        let cachedItem: CacheEntry<T> | null = null;
        
        // Check memory cache first
        const memoryCachedItem = memoryCache.get(key);
        if (memoryCachedItem) {
          cachedItem = { ...memoryCachedItem };
        } else {
          // If not in memory, check storage
          const storedItem = storage.getItem(storageKey);
          if (storedItem) {
            cachedItem = safeJSONParse(storedItem);
          }
        }
        
        // If we found a cached item, update its expiry
        if (cachedItem) {
          cachedItem.expiry = Date.now() + ttl;
          
          // Update both memory and storage
          memoryCache.set(key, cachedItem);
          
          try {
            storage.setItem(storageKey, JSON.stringify(cachedItem));
          } catch (storageError) {
            console.warn('Failed to refresh item in storage:', storageError);
          }
        }
      } catch (error) {
        console.error('Error refreshing cache:', error);
      }
    }
  };
};
