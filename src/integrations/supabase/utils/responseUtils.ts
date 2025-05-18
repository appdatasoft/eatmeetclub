
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
  
  // Always clone the response before any processing
  return response.clone();
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
