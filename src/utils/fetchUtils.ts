
/**
 * Configuration options for fetchWithRetry
 */
export interface FetchRetryOptions {
  retries: number;
  baseDelay: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Utility function to retry a fetch operation with exponential backoff
 * @param fetchFn Function that performs the fetch operation
 * @param options Configuration options for retries
 * @returns The result of the fetch operation
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: FetchRetryOptions
): Promise<T> => {
  const {
    retries,
    baseDelay,
    maxDelay = 5000,
    shouldRetry = () => true,
  } = options;

  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts <= retries) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');

      if (!shouldRetry(error)) {
        console.warn(`FetchWithRetry: error is not retryable — aborting immediately.`);
        throw lastError;
      }

      const delay = Math.min(baseDelay * 2 ** attempts, maxDelay);

      console.warn(
        `FetchWithRetry: attempt ${attempts + 1} failed. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;
    }
  }

  throw lastError || new Error('All fetch attempts failed');
};

// Add missing exports for backward compatibility
export const fetchWithCache = async <T>(url: string, options?: RequestInit): Promise<T> => {
  // Simple implementation for backward compatibility
  const response = await fetch(url, options);
  return await response.json() as T;
};

export const clearFetchCache = (): void => {
  // Dummy implementation for backward compatibility
  console.log('Cache cleared');
};

export const getCachedResponse = <T>(key: string): T | null => {
  // Dummy implementation for backward compatibility
  return null;
};

export const safelyParseResponse = async <T>(response: Response): Promise<T> => {
  // Simple implementation for backward compatibility
  return await response.json() as T;
};
