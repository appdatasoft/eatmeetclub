
/**
 * Simple in-memory request cache
 * This helps prevent "body stream already read" errors by storing cached responses
 */

class RequestCache {
  private cache: Map<string, any> = new Map();

  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const requestCache = new RequestCache();
