
interface CacheOptions {
  staleWhileRevalidate?: boolean;
  maxAge?: number;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Creates a session storage cache with expiration
 * @param key Cache key
 * @param ttl Time to live in milliseconds
 * @param options Additional options
 * @returns Cache API with get, set, delete methods
 */
export function createSessionCache<T>(
  key: string, 
  ttl: number = 60000, // Default 60 seconds
  options: CacheOptions = {}
) {
  const storageKey = `cache_${key}`;
  
  const get = (): T | null => {
    try {
      const item = sessionStorage.getItem(storageKey);
      if (!item) return null;
      
      const cached = JSON.parse(item) as CachedData<T>;
      const now = Date.now();
      
      if (now - cached.timestamp > ttl) {
        // Cache is expired
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.warn(`Error retrieving ${key} from session cache:`, error);
      return null;
    }
  };
  
  const set = (data: T): void => {
    try {
      const cache: CachedData<T> = {
        data,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(storageKey, JSON.stringify(cache));
    } catch (error) {
      console.warn(`Error storing ${key} in session cache:`, error);
    }
  };
  
  const del = (): void => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(`Error removing ${key} from session cache:`, error);
    }
  };
  
  const isStale = (): boolean => {
    try {
      const item = sessionStorage.getItem(storageKey);
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
  
  const refresh = (): void => {
    try {
      const item = sessionStorage.getItem(storageKey);
      if (!item) return;
      
      const cached = JSON.parse(item) as CachedData<T>;
      cached.timestamp = Date.now();
      
      sessionStorage.setItem(storageKey, JSON.stringify(cached));
    } catch (error) {
      console.warn(`Error refreshing ${key} in session cache:`, error);
    }
  };
  
  return { get, set, del, isStale, refresh };
}
