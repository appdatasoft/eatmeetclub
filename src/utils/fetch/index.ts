
/**
 * Centralized exports for fetch utilities
 * This ensures backward compatibility with existing code
 */

// Export old utilities for backward compatibility
export { 
  fetchWithRetry, 
  fetchWithCache, 
  clearFetchCache,
  getCachedResponse,
  safelyParseResponse,
  type FetchRetryOptions 
} from '@/utils/fetchUtils';

// Export session storage cache
export { createSessionCache } from './sessionStorageCache';
export { createOfflineCache } from './localStorageCache';
export { requestTracker } from './requestTracker';

// Export new unified fetch client with improved performance
export {
  fetchClient,
  get,
  post,
  put,
  del,
  patch,
  clearCache,
  prefetch,  // Add prefetching capability
  type FetchClientOptions,
  type FetchResponse
} from '@/lib/fetch-client';
