
/**
 * Centralized exports for fetch utilities
 * This ensures backward compatibility with existing code
 */

export { 
  fetchWithRetry, 
  fetchWithCache, 
  clearFetchCache,
  getCachedResponse,
  type FetchRetryOptions 
} from '@/utils/fetchUtils';

export { createSessionCache } from './sessionStorageCache';
export { createOfflineCache } from './localStorageCache';
export { requestTracker } from './requestTracker';
