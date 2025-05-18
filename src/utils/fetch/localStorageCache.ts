
/**
 * Creates an offline-first cache for fetch operations using localStorage
 */
export const createOfflineCache = <T>(cacheKey: string, ttlMs = 10 * 60 * 1000) => {
  return {
    get: (): T | null => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        
        // Check if cache has expired
        if (Date.now() - timestamp > ttlMs) {
          localStorage.removeItem(cacheKey);
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
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data,
            timestamp: Date.now()
          })
        );
      } catch (e) {
        console.error('Cache storage error:', e);
      }
    }
  };
};
