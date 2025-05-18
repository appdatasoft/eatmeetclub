/**
 * Creates a session-based cache for fetch operations using sessionStorage
 * This is useful for temporary caching of data that should persist only for the current browser session
 */
export interface SessionCacheOptions {
  ttlMs?: number;
  staleWhileRevalidate?: boolean;
}

export const createSessionCache = <T>(cacheKey: string, ttlMs = 10 * 60 * 1000, options?: SessionCacheOptions) => {
  const fullCacheKey = `session_cache_${cacheKey}`;
  
  return {
    get: (): T | null => {
      try {
        const cached = sessionStorage.getItem(fullCacheKey);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        
        // Check if cache has expired
        if (Date.now() - timestamp > ttlMs) {
          // If using stale-while-revalidate pattern, return stale data but mark as expired
          if (options?.staleWhileRevalidate) {
            console.log(`Returning stale data for ${cacheKey} while revalidating`);
            return data;
          }
          
          // Otherwise clear the expired cache
          sessionStorage.removeItem(fullCacheKey);
          return null;
        }
        
        return data;
      } catch (e) {
        console.error('Cache retrieval error:', e);
        return null;
      }
    },
    
    set: (data: T): void => {
      try {
        // Make sure we're not storing circular references
        const safeData = JSON.parse(JSON.stringify(data));
        
        sessionStorage.setItem(
          fullCacheKey,
          JSON.stringify({
            data: safeData,
            timestamp: Date.now()
          })
        );
      } catch (e) {
        console.error('Cache storage error:', e);
      }
    },
    
    remove: (): void => {
      try {
        sessionStorage.removeItem(fullCacheKey);
      } catch (e) {
        console.error('Cache removal error:', e);
      }
    },
    
    isStale: (): boolean => {
      try {
        const cached = sessionStorage.getItem(fullCacheKey);
        if (!cached) return true;
        
        const { timestamp } = JSON.parse(cached);
        return Date.now() - timestamp > ttlMs;
      } catch (e) {
        return true;
      }
    }
  };
};
