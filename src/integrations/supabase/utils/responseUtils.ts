
/**
 * Helper functions for handling responses in a safe way
 * This is critical to prevent "body stream already read" errors
 */

// Safely handle response objects to prevent "body stream already read" errors
export const handleResponse = async (response: Response): Promise<Response> => {
  // If we get a 429 status code, throw an error to trigger retry logic
  if (response.status === 429) {
    throw new Error(`Rate limit hit (429)`);
  }
  
  try {
    // Always clone the response before any processing to prevent "body stream already read" errors
    return response.clone();
  } catch (error) {
    console.error("Error cloning response:", error);
    // If cloning fails for some reason, return the original response
    // This is a fallback and should rarely happen
    return response;
  }
};

// Safely extract JSON from a response without causing "body stream already read" errors
export const extractResponseData = async <T>(response: Response): Promise<T> => {
  try {
    // Always clone the response before reading it
    const clonedResponse = response.clone();
    return await clonedResponse.json();
  } catch (error) {
    console.error("Failed to extract response data:", error);
    throw error;
  }
};

// Helper to safely read text from a response
export const extractResponseText = async (response: Response): Promise<string> => {
  try {
    // Always clone the response before reading it
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
    // Always clone the response before reading it
    const clonedResponse = response.clone();
    const data = await clonedResponse.json();
    
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
