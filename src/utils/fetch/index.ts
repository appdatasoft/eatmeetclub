
/**
 * Centralized exports for fetch utilities
 * This ensures backward compatibility with existing code
 */

export { fetchWithRetry, fetchWithCache, type FetchRetryOptions } from '@/utils/fetchUtils';
export { createSessionCache } from './sessionStorageCache';
export { requestTracker } from './requestTracker';
export { createOfflineCache } from './localStorageCache';
