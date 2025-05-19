/**
 * Helper functions for handling responses in a safe way
 * This is critical to prevent "body stream already read" errors
 */

// Cache for storing processed response data
const responseBodyCache = new Map<string, any>();

// Safely handle response objects to prevent "body stream already read" errors
export const handleResponse = async (response: Response): Promise<Response> => {
  // If we get a 429 status code, throw an error to trigger retry logic
  if (response.status === 429) {
    throw new Error(`Rate limit hit (429)`);
  }
  
  // Generate a unique cache key for this response
  const cacheKey = `${response.url}-${Date.now()}`;
  
  try {
    // Store the response text or json in memory
    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      responseBodyCache.set(cacheKey, {
        type: 'json',
        data: responseData
      });
    } else {
      responseData = await response.text();
      responseBodyCache.set(cacheKey, {
        type: 'text',
        data: responseData
      });
    }
    
    // Create a new response from the cached data
    return createResponseFromCache(responseData, response.status, response.headers, contentType);
  } catch (error) {
    console.error("Error processing response:", error);
    // If cloning fails, return a mock response to prevent further errors
    return new Response(JSON.stringify({ error: "Failed to process response" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Helper to create a new response from cached data
export const createResponseFromCache = (
  data: any,
  status: number = 200,
  headers?: Headers,
  contentType?: string | null
): Response => {
  // Create a new headers object
  const newHeaders = new Headers();
  
  // Copy all headers if they exist
  if (headers) {
    headers.forEach((value, key) => {
      newHeaders.set(key, value);
    });
  }
  
  // Set content type if provided
  if (contentType) {
    newHeaders.set('Content-Type', contentType);
  } else if (typeof data === 'object') {
    newHeaders.set('Content-Type', 'application/json');
  }
  
  const body = typeof data === 'object' ? JSON.stringify(data) : String(data);
  return new Response(body, {
    status,
    headers: newHeaders
  });
};

// Safely extract JSON from a response without causing "body stream already read" errors
export const extractResponseData = async <T>(response: Response): Promise<T> => {
  try {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    }
  } catch (error) {
    console.error("Failed to extract response data:", error);
    throw error;
  }
};

// Helper to safely read text from a response
export const extractResponseText = async (response: Response): Promise<string> => {
  try {
    return await response.text();
  } catch (error) {
    console.error("Failed to extract response text:", error);
    throw error;
  }
};

// Cache for responses to prevent multiple reads
const responseCache = new Map<string, any>();

// Helper to safely get JSON data with caching
export const getResponseData = async <T>(
  response: Response, 
  cacheKey?: string
): Promise<T> => {
  // Use cache if available
  if (cacheKey && responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }
  
  try {
    const contentType = response.headers.get('Content-Type');
    let data: T;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json() as T;
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = text as unknown as T;
      }
    }
    
    // Cache the result if cacheKey is provided
    if (cacheKey) {
      responseCache.set(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    console.error("Failed to get response data:", error);
    throw error;
  }
};

// Helper to clear cache for specific keys or prefixes
export const clearResponseCache = (keyOrPrefix?: string) => {
  if (!keyOrPrefix) {
    responseCache.clear();
    return;
  }
  
  if (responseCache.has(keyOrPrefix)) {
    responseCache.delete(keyOrPrefix);
  } else {
    // If it's a prefix, clear all keys that start with it
    for (const key of responseCache.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        responseCache.delete(key);
      }
    }
  }
};

// Function to create a safe response from cached data
export const createResponseFromCachedData = <T>(data: T, status = 200): Response => {
  return new Response(new Blob([JSON.stringify(data)], {
    type: 'application/json'
  }), {
    headers: { 'Content-Type': 'application/json' },
    status
  });
};

// Helper to check if a response has already been read
export const isResponseBodyUsed = (response: Response): boolean => {
  return response.bodyUsed;
};
