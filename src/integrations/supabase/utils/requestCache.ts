/**
 * Enhanced in-memory cache for API requests with better error recovery
 */

type CacheEntry<T> = {
  data: T;
  expiry: number;
  createdAt: number;
};

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize: number;
  
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }
  
  set<T>(key: string, data: T, ttlMs = 60000): void {
    // Prevent cache from growing too large
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries or expired entries first
      const now = Date.now();
      const entries = Array.from(this.cache.entries());
      
      // Sort by expiry (expired first) then by age
      entries.sort((a, b) => {
        // If one is expired and the other isn't, prioritize the expired one
        if (a[1].expiry < now && b[1].expiry >= now) return -1;
        if (b[1].expiry < now && a[1].expiry >= now) return 1;
        // Otherwise sort by age (oldest first)
        return a[1].createdAt - b[1].createdAt;
      });
      
      // Remove oldest 20% of entries to make space
      const removeCount = Math.ceil(this.maxSize * 0.2);
      for (let i = 0; i < removeCount && i < entries.length; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
      createdAt: Date.now()
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if entry has expired
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clear all expired entries
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
  
  // Returns how many milliseconds until the entry expires, or 0 if it's expired
  ttl(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) {
      return 0;
    }
    
    const remainingTime = entry.expiry - Date.now();
    return Math.max(0, remainingTime);
  }
}

// Export a singleton instance
export const requestCache = new RequestCache();
