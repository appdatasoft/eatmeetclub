
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
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for OAuth operations
      
      const fetchOptions = {
        ...options,
        signal: controller.signal,
        // Add cache control headers to prevent caching issues
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      };
      
      console.log(`Fetching ${url} with method ${options.method || 'GET'}`);
      
      // For OAuth callback requests, log more details but protect sensitive data
      if (url.includes('connect-social-media') && options.body) {
        try {
          const body = JSON.parse(options.body.toString());
          console.log(`Request body for ${url}: `, {
            ...body,
            code: body.code ? `${body.code.substring(0, 10)}... (length: ${body.code.length})` : undefined,
            redirectUri: body.redirectUri
          });
        } catch (e) {
          console.log('Could not parse request body for logging');
        }
      }
      
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
      
      // If rate limited (429) or server error (5xx), retry with backoff
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
      
      // For successful responses, return directly
      if (response.ok) {
        return response;
      }
      
      // For error responses, capture more details
      try {
        const errorText = await response.clone().text();
        let errorInfo = errorText;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorInfo = JSON.stringify(errorJson);
        } catch {
          // If it's not JSON, use the raw text
        }
        
        console.error(`Request failed with status: ${response.status}, details:`, errorInfo);
        
        if (retries === 0) {
          return response;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      } catch (error) {
        console.error('Error reading response body:', error);
        if (retries === 0) return response;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Request timed out, retrying...');
        if (retries === 0) throw new Error('Request timed out after multiple retries');
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      
      if (retries === 0) throw error;
      
      // For network errors, retry with exponential backoff
      console.warn(`Fetch error: ${error.message}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(retries - 1, delay * 2);
    }
  };
  
  // Initial retry attempt with exponential backoff
  return fetchWithRetry(4, 2000); // 4 retries with 2s initial delay
};
