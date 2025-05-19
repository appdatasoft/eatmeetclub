
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
    
    // Handle empty responses first to avoid JSON parse errors
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      responseData = {};
      responseBodyCache.set(cacheKey, {
        type: 'json',
        data: responseData
      });
      return createResponseFromCache(responseData, response.status, response.headers, contentType);
    }
    
    // Always clone before reading the body
    const clonedResponse = response.clone();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        // First check if there's any content to parse
        const text = await clonedResponse.text();
        if (!text || text.trim() === '') {
          // Handle empty but JSON content-type responses
          responseData = {};
          console.warn("Empty JSON response received");
        } else {
          try {
            responseData = JSON.parse(text);
          } catch (parseError) {
            console.error("Failed to parse JSON response:", parseError, "Raw text:", text);
            // Return an empty object to prevent further parsing errors
            responseData = { error: "Invalid JSON response", _rawText: text.substring(0, 100) };
          }
        }
        
        responseBodyCache.set(cacheKey, {
          type: 'json',
          data: responseData
        });
      } catch (jsonError) {
        console.error("Error handling JSON response:", jsonError);
        // If JSON processing fails completely, return an empty object
        responseData = { error: "Failed to process response" };
        responseBodyCache.set(cacheKey, {
          type: 'json',
          data: responseData
        });
      }
    } else {
      try {
        responseData = await clonedResponse.text();
        // Check if text looks like JSON despite content-type
        if (responseData && 
           (responseData.startsWith('{') || responseData.startsWith('[')) && 
           (responseData.endsWith('}') || responseData.endsWith(']'))) {
          try {
            responseData = JSON.parse(responseData);
            responseBodyCache.set(cacheKey, {
              type: 'json',
              data: responseData
            });
          } catch {
            // Not valid JSON after all, keep as text
            responseBodyCache.set(cacheKey, {
              type: 'text',
              data: responseData
            });
          }
        } else {
          responseBodyCache.set(cacheKey, {
            type: 'text',
            data: responseData || ""
          });
        }
      } catch (textError) {
        console.error("Error reading response text:", textError);
        responseData = "";
        responseBodyCache.set(cacheKey, {
          type: 'text',
          data: responseData
        });
      }
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
  
  // Always ensure Accept and Content-Type are set properly
  newHeaders.set('Accept', 'application/json');
  
  // Set content type if provided
  if (contentType) {
    newHeaders.set('Content-Type', contentType);
  } else if (typeof data === 'object') {
    newHeaders.set('Content-Type', 'application/json');
  }
  
  // Safely stringify the body data with fallbacks for circular references
  let body;
  try {
    body = typeof data === 'object' ? JSON.stringify(data) : String(data);
  } catch (stringifyError) {
    console.error("Error stringifying response data:", stringifyError);
    // Provide a fallback response if JSON stringify fails
    body = JSON.stringify({ error: "Failed to stringify response data" });
  }
  
  return new Response(body, {
    status,
    headers: newHeaders
  });
};

// Safely extract JSON from a response without causing "body stream already read" errors
export const extractResponseData = async <T>(response: Response): Promise<T> => {
  try {
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('Content-Type');
    
    // Handle empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }
    
    // Always clone the response before reading the body
    const clonedResponse = response.clone();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        // First check if there's any content to parse
        const text = await clonedResponse.text();
        if (!text || text.trim() === '') {
          return {} as T;
        }
        
        try {
          return JSON.parse(text) as T;
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          return {} as T;
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        return {} as T;
      }
    } else {
      const text = await clonedResponse.text();
      if (!text || text.trim() === '') {
        return {} as T;
      }
      
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
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    // Always clone the response before reading the body
    const clonedResponse = response.clone();
    return await clonedResponse.text();
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
    
    // Clone the response before reading it
    const clonedResponse = response.clone();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await clonedResponse.json() as T;
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        // Handle empty or malformed JSON responses
        const text = await response.clone().text();
        console.log("Response text content:", text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        
        try {
          data = text ? JSON.parse(text) as T : {} as T;
        } catch (parseError) {
          console.warn("Secondary JSON parse error:", parseError);
          // Return empty object as fallback
          data = {} as T;
        }
      }
    } else {
      const text = await clonedResponse.text();
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
