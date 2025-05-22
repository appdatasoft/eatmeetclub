
/**
 * Utility function to retry a fetch operation with exponential backoff
 * @param fetchFn Function that performs the fetch operation
 * @param options Configuration options for retries
 * @returns The result of the fetch operation
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: { retries: number; baseDelay: number }
): Promise<T> => {
  const { retries, baseDelay } = options;
  
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts <= retries) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.warn(`Fetch attempt ${attempts + 1} failed, retrying in ${baseDelay * Math.pow(2, attempts)}ms...`);
      
      // Wait before retrying with exponential backoff
      await new Promise((resolve) => 
        setTimeout(resolve, baseDelay * Math.pow(2, attempts))
      );
      
      attempts++;
    }
  }

  throw lastError || new Error('All fetch attempts failed');
};
