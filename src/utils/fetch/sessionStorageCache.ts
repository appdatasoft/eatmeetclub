/**
 * Advanced session storage cache with progressive TTL
 */
export const createSessionCache = <T>(
  cacheKey: string, 
  baseTtlMs = 5 * 60 * 1000, // 5 minutes default
  options = { maxItems: 50 }
) => {
  // Helper to clean up old cache entries if we have too many
  const cleanupOldEntries = () => {
    try {
      const allKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_')) {
          allKeys.push(key);
        }
      }
      
      if (allKeys.length > options.maxItems) {
        // Get all cached items with timestamps
        const items = allKeys.map(key => {
          try {
            const value = sessionStorage.getItem(key);
            if (!value) return { key, timestamp: 0 };
            const { timestamp } = JSON.parse(value);
            return { key, timestamp };
          } catch {
            return { key, timestamp: 0 };
          }
        });
        
        // Sort by oldest first
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest items
        const toRemove = items.slice(0, items.length - options.maxItems);
        toRemove.forEach(item => {
          sessionStorage.removeItem(item.key);
        });
      }
    } catch (e) {
      console.warn('Error cleaning up cache:', e);
    }
  };
  
  return {
    get: (): T | null => {
      try {
        const cached = sessionStorage.getItem(`cache_${cacheKey}`);
        if (!cached) return null;
        
        const { data, timestamp, accessCount = 0 } = JSON.parse(cached);
        
        // Progressive TTL - the more an item is accessed, the longer we keep it
        const adjustedTtl = baseTtlMs * Math.min(3, Math.max(1, 1 + accessCount * 0.2));
        
        // Check if cache has expired
        if (Date.now() - timestamp > adjustedTtl) {
          sessionStorage.removeItem(`cache_${cacheKey}`);
          return null;
        }
        
        // Update access count
        sessionStorage.setItem(`cache_${cacheKey}`, JSON.stringify({
          data,
          timestamp,
          accessCount: accessCount + 1
        }));
        
        return data;
      } catch (e) {
        console.error('SessionCache retrieval error:', e);
        return null;
      }
    },
    
    set: (data: T): void => {
      try {
        sessionStorage.setItem(
          `cache_${cacheKey}`,
          JSON.stringify({
            data,
            timestamp: Date.now(),
            accessCount: 0
          })
        );
        
        // Clean up old entries if needed
        cleanupOldEntries();
      } catch (e) {
        console.error('SessionCache storage error:', e);
        // Try removing some items to make space
        try {
          cleanupOldEntries();
          // Try again
          sessionStorage.setItem(
            `cache_${cacheKey}`,
            JSON.stringify({
              data,
              timestamp: Date.now(),
              accessCount: 0
            })
          );
        } catch {
          // Just give up if it still fails
        }
      }
    },
    
    // Force remove a cache entry
    remove: (): void => {
      try {
        sessionStorage.removeItem(`cache_${cacheKey}`);
      } catch (e) {
        console.error('SessionCache removal error:', e);
      }
    }
  };
};
