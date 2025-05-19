
/**
 * Enhanced session storage based cache with fallback to memory
 * Use this for caching API responses that might be needed across page refreshes
 */

interface CacheOptions {
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
  storagePrefix?: string; // Prefix for storage keys
  useLocalStorage?: boolean; // Use localStorage instead of sessionStorage
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
  
  const storage = useLocalStorage ? localStorage : sessionStorage;
  const memoryCache = new Map<string, any>();
  const storageKey = `${storagePrefix}${key}`;
  
  // Helper function to safely parse JSON
  const safeJSONParse = (data: string | null) => {
    if (!data) return null;
    try {
      return JSON.parse(data);
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
        const cacheEntry = {
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
        const memoryCachedItem = memoryCache.get(key);
        if (memoryCachedItem) {
          // Update expiry time
          memoryCachedItem.expiry = Date.now() + ttl;
          memoryCache.set(key, memoryCachedItem);

          // Try to update in storage too
          try {
            storage.setItem(storageKey, JSON.stringify(memoryCachedItem));
          } catch (storageError) {
            console.warn('Failed to refresh item in sessionStorage:', storageError);
          }
        } else {
          // Check storage if not in memory
          const storedItem = storage.getItem(storageKey);
          if (storedItem) {
            const cachedItem = safeJSONParse(storedItem);
            if (cachedItem) {
              cachedItem.expiry = Date.now() + ttl;
              
              // Update both memory and storage
              memoryCache.set(key, cachedItem);
              storage.setItem(storageKey, JSON.stringify(cachedItem));
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing cache:', error);
      }
    }
  };
};
