
/**
 * Utilities for implementing exponential backoff and retry logic
 */

export interface FetchRetryOptions {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Executes a fetch operation with exponential backoff retries and throttling
 */
import { requestTracker } from './requestTracker';

export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: FetchRetryOptions = {}
): Promise<T> => {
  const {
    retries = 3,
    baseDelay = 1000,
    maxDelay = 15000,
    shouldRetry = () => true
  } = options;
  
  let attempt = 0;
  
  // Add debug info
  const startTime = Date.now();
  const debugInfo = {
    startTime,
    attempts: 0,
    totalTime: 0
  };
  
  while (true) {
    try {
      // Check if we need to wait due to rate limiting
      await requestTracker.checkAndWait();
      
      debugInfo.attempts++;
      
      // Try the fetch operation
      const result = await fetchFn();
      
      // Release the request slot
      requestTracker.releaseRequest();
      
      // Log success info for debugging
      debugInfo.totalTime = Date.now() - startTime;
      console.log(`Request succeeded after ${debugInfo.attempts} attempt(s) and ${debugInfo.totalTime}ms`);
      
      return result;
    } catch (error: any) {
      // Release the request slot even on error
      requestTracker.releaseRequest();
      
      attempt++;
      
      // If we've used all retries or shouldn't retry this particular error
      if (attempt >= retries || !shouldRetry(error)) {
        // Log failure info for debugging
        debugInfo.totalTime = Date.now() - startTime;
        console.error(`Request failed permanently after ${debugInfo.attempts} attempt(s) and ${debugInfo.totalTime}ms`, error);
        
        throw error;
      }
      
      // Calculate delay with exponential backoff + jitter
      const jitter = Math.random() * 500; // Add up to 500ms of randomness
      const delay = Math.min(
        maxDelay,
        Math.pow(2, attempt) * baseDelay + jitter
      );
      
      console.warn(
        `Request failed (attempt ${attempt}/${retries}). Retrying in ${Math.round(delay)}ms...`, 
        error
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
