
interface CacheOptions {
  staleWhileRevalidate?: boolean;
  maxAge?: number;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Creates a local storage cache with expiration for better offline support
 * @param key Cache key
 * @param ttl Time to live in milliseconds
 * @param options Additional options
 * @returns Cache API with get, set, delete methods
 */
export function createOfflineCache<T>(
  key: string, 
  ttl: number = 86400000, // Default 24 hours
  options: CacheOptions = {}
) {
  const storageKey = `offline_cache_${key}`;
  
  const get = (): T | null => {
    try {
      const item = localStorage.getItem(storageKey);
      if (!item) return null;
      
      const cached = JSON.parse(item) as CachedData<T>;
      const now = Date.now();
      
      if (now - cached.timestamp > ttl) {
        // Cache is expired but in offline mode we might still want to use it
        if (navigator.onLine === false) {
          console.log('Using expired cache while offline');
          return cached.data;
        }
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.warn(`Error retrieving ${key} from offline cache:`, error);
      return null;
    }
  };
  
  const set = (data: T): void => {
    try {
      const cache: CachedData<T> = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(cache));
    } catch (error) {
      console.warn(`Error storing ${key} in offline cache:`, error);
    }
  };
  
  const del = (): void => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(`Error removing ${key} from offline cache:`, error);
    }
  };
  
  const isStale = (): boolean => {
    try {
      const item = localStorage.getItem(storageKey);
      if (!item) return true;
      
      const cached = JSON.parse(item) as CachedData<T>;
      const now = Date.now();
      
      // If staleWhileRevalidate is enabled, use a shorter threshold
      const staleThreshold = options.staleWhileRevalidate
        ? options.maxAge || (ttl / 2) // Use half the TTL by default
        : ttl;
        
      return (now - cached.timestamp) > staleThreshold;
    } catch (error) {
      return true;
    }
  };
  
  return { get, set, del, isStale };
}
