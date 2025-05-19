
import { requestTracker } from './requestTracker';

interface RetryOptions {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  factor?: number;
}

/**
 * Implements an exponential backoff retry strategy for API calls
 * @param fn The function to retry
 * @param options Retry configuration options
 * @returns The result of the function
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    baseDelay = 500,
    maxDelay = 10000,
    factor = 2,
  } = options;

  let lastError: unknown;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Wait until we're below the concurrent request limit
      await requestTracker.checkAndWait();
      
      // Track this request
      requestTracker.startRequest();
      
      // Make the request
      const result = await fn();
      
      // Release the request slot
      requestTracker.releaseRequest();
      
      return result;
    } catch (err) {
      lastError = err;
      
      // Release the request slot on error too
      requestTracker.releaseRequest();
      
      if (attempt < retries) {
        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(factor, attempt), maxDelay);
        
        // Add some jitter to prevent thundering herd issues
        const jitter = Math.random() * 0.3 * delay;
        
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw lastError;
}
