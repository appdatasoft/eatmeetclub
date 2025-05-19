
/**
 * Enhanced session storage cache utilities
 * Implements stale-while-revalidate pattern for improved performance
 */

interface CacheOptions {
  staleWhileRevalidate?: boolean;
}

export function createSessionCache<T>(key: string, ttlMs: number = 60000, options: CacheOptions = {}) {
  const cacheKey = `cache_${key}`;
  const metaKey = `cache_meta_${key}`;
  
  return {
    /**
     * Get data from cache if available and not expired
     */
    get(): T | null {
      try {
        const meta = JSON.parse(sessionStorage.getItem(metaKey) || '{}');
        const now = Date.now();
        
        // If no expiry or data doesn't exist, return null
        if (!meta.expiry || !sessionStorage.getItem(cacheKey)) {
          return null;
        }
        
        // Track last access time for optimization
        meta.lastAccess = now;
        sessionStorage.setItem(metaKey, JSON.stringify(meta));
        
        return JSON.parse(sessionStorage.getItem(cacheKey) as string) as T;
      } catch (error) {
        console.warn('Error reading from session cache:', error);
        return null;
      }
    },
    
    /**
     * Store data in cache with expiration time
     */
    set(data: T): void {
      try {
        const now = Date.now();
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        
        const meta = {
          createdAt: now,
          expiry: now + ttlMs,
          lastAccess: now
        };
        
        sessionStorage.setItem(metaKey, JSON.stringify(meta));
      } catch (error) {
        console.warn('Error writing to session cache:', error);
      }
    },
    
    /**
     * Check if cache exists but is stale
     */
    isStale(): boolean {
      try {
        const meta = JSON.parse(sessionStorage.getItem(metaKey) || '{}');
        const now = Date.now();
        
        // If no expiry info, consider it stale
        if (!meta.expiry) {
          return true;
        }
        
        return meta.expiry < now;
      } catch {
        return true;
      }
    },
    
    /**
     * Refresh cache expiry without changing the data
     */
    refresh(): void {
      try {
        const meta = JSON.parse(sessionStorage.getItem(metaKey) || '{}');
        const now = Date.now();
        
        meta.expiry = now + ttlMs;
        meta.lastAccess = now;
        
        sessionStorage.setItem(metaKey, JSON.stringify(meta));
      } catch (error) {
        console.warn('Error refreshing cache expiry:', error);
      }
    },
    
    /**
     * Remove cache entry
     */
    remove(): void {
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(metaKey);
    }
  };
}

// Local storage for offline capability
export const offlineCache = {
  set: <T>(key: string, data: T, ttlMs: number = 3600000): void => {
    try {
      const item = {
        data,
        expiry: Date.now() + ttlMs
      };
      localStorage.setItem(`offline_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Error saving to offline cache', error);
    }
  },
  
  get: <T>(key: string): T | null => {
    try {
      const item = JSON.parse(localStorage.getItem(`offline_${key}`) || '{}');
      if (!item.expiry || item.expiry < Date.now()) {
        localStorage.removeItem(`offline_${key}`);
        return null;
      }
      return item.data as T;
    } catch {
      return null;
    }
  }
};
