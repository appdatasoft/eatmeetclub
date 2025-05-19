
// Simple in-memory cache for requests
class RequestCache {
  private cache = new Map<string, any>();

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const requestCache = new RequestCache();
