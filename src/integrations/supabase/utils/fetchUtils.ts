
import { handleResponse } from './responseUtils';
import { requestQueue } from './requestQueue';

// Custom fetch function with retry logic, queue management and improved caching
export const customFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Create a cache key based on the request
  const cacheKey = `${url}-${JSON.stringify(options.body || {})}-${options.method || 'GET'}`;
  
  const fetchWithRetry = async (retries: number, delay: number): Promise<Response> => {
    try {
      // Create a controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s timeout
      
      const fetchOptions = {
        ...options,
        signal: controller.signal,
        // Add cache control headers to prevent caching issues with CORS preflight
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      };
      
      console.log(`Fetching ${url} with method ${options.method || 'GET'}`);
      
      // Use the request queue to control concurrency and apply rate limiting
      const response = await requestQueue.add(
        async () => {
          try {
            const resp = await fetch(url, fetchOptions);
            console.log(`Response received from ${url}: status ${resp.status}`);
            return resp;
          } catch (error) {
            console.error(`Fetch error for ${url}:`, error);
            throw error;
          }
        },
        options.method === 'GET' ? cacheKey : undefined // Only cache GET requests
      );
      
      clearTimeout(timeoutId);
      
      // If rate limited (429) or server error (5xx), add longer retry delay
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        if (retries === 0) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        
        const retryDelay = response.status === 429 ? delay * 5 : delay * 3;
        console.warn(`Rate limited or server error (${response.status}). Waiting ${retryDelay}ms before retry.`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchWithRetry(retries - 1, retryDelay);
      }
      
      if (response.ok) {
        return response;
      }
      
      if (retries === 0) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(retries - 1, delay * 2);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Request timed out, retrying...');
        if (retries === 0) throw new Error('Request timed out after multiple retries');
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      
      if (retries === 0) throw error;
      
      // For network errors, retry
      console.warn(`Fetch error: ${error.message}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(retries - 1, delay * 2);
    }
  };
  
  // Initial retry attempt with exponential backoff
  return fetchWithRetry(4, 3000); // Increased retries and initial delay
};
