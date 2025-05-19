
/**
 * Utility functions for handling fetch requests with retry capability
 */

export type FetchRetryOptions = {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
  headers?: Record<string, string>; // Add headers support
};

/**
 * Execute a fetch operation with automatic retrying
 * 
 * @param fetchFn Function that returns a Promise with the fetch operation
 * @param options Configuration options for retry behavior
 * @returns The result of the fetch operation
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>, 
  options: FetchRetryOptions = {}
): Promise<T> => {
  const { 
    retries = 3, 
    baseDelay = 1000, 
    maxDelay = 10000,
    shouldRetry = () => true
  } = options;
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add console log to track retry attempts
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} of ${retries}`);
      }
      
      // Execute the fetch function
      return await fetchFn();
      
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        console.error('Error not eligible for retry:', error);
        throw error;
      }
      
      // Don't wait on the last attempt
      if (attempt === retries) {
        console.error(`All ${retries} retry attempts failed:`, error);
        break;
      }
      
      // Calculate exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5),
        maxDelay
      );
      
      console.log(`Waiting ${delay.toFixed(0)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Helper function to safely clone and parse a Response object
 * Prevents "body stream already read" errors by cloning the response before reading
 */
export const safelyParseResponse = async <T>(response: Response): Promise<T> => {
  // Clone the response to ensure we can read it multiple times if needed
  const clonedResponse = response.clone();
  
  try {
    // Try to parse as JSON first
    return await clonedResponse.json() as T;
  } catch (error) {
    // If JSON parsing fails, try text
    try {
      const text = await response.text();
      
      // If text is empty, return an empty object
      if (!text) {
        return {} as T;
      }
      
      // Try to parse text as JSON
      try {
        return JSON.parse(text) as T;
      } catch (jsonError) {
        // If parsing fails, return the text itself
        return text as unknown as T;
      }
    } catch (textError) {
      console.error('Error parsing response:', textError);
      throw new Error('Failed to parse response: body stream already read');
    }
  }
};

// Cache utility functions
const responseCache = new Map<string, { data: any, expires: number }>();

/**
 * Fetch with cache functionality
 */
export const fetchWithCache = async <T>(
  url: string,
  options: RequestInit & { cacheTime?: number } = {},
  cacheKey?: string
): Promise<T> => {
  const key = cacheKey || url;
  const { cacheTime = 60000, ...fetchOptions } = options;
  
  // Check cache
  if (responseCache.has(key)) {
    const cached = responseCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }
    // Clear expired cache
    responseCache.delete(key);
  }
  
  // Make the fetch call
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  // Clone response and parse
  const data = await safelyParseResponse<T>(response);
  
  // Store in cache
  responseCache.set(key, {
    data,
    expires: Date.now() + cacheTime
  });
  
  return data;
};

/**
 * Clear cache for a specific key or all cache if no key provided
 */
export const clearFetchCache = (key?: string): void => {
  if (key) {
    responseCache.delete(key);
  } else {
    responseCache.clear();
  }
};

/**
 * Get cached response data if available
 */
export const getCachedResponse = <T>(key: string): T | null => {
  if (responseCache.has(key)) {
    const cached = responseCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }
    // Clear expired cache
    responseCache.delete(key);
  }
  return null;
};
