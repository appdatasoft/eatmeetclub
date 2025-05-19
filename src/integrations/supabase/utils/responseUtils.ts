
/**
 * Utility functions for handling Supabase response objects
 * to prevent common issues like "body stream already read" errors
 */

/**
 * Safely handles a Response object by cloning it to prevent "body stream already read" errors
 */
export const handleResponse = (response: Response): Response => {
  try {
    // Always clone the response to avoid issues with multiple reads
    return response.clone();
  } catch (error) {
    console.warn('Failed to clone response, returning original:', error);
    return response;
  }
};

/**
 * Safely parses a JSON response with proper error handling
 */
export const safeJsonParse = async <T>(response: Response): Promise<T> => {
  // Always clone the response before reading
  const clonedResponse = response.clone();
  
  try {
    return await clonedResponse.json() as T;
  } catch (error) {
    console.warn('Error parsing JSON response:', error);
    
    // Attempt to read as text as fallback
    try {
      const textContent = await response.text();
      
      if (!textContent || textContent.trim() === '') {
        console.warn('Empty response body');
        return {} as T;
      }
      
      try {
        // Try to parse the text as JSON
        return JSON.parse(textContent) as T;
      } catch (jsonError) {
        // If that fails too, return the text content as is
        console.warn('Could not parse text as JSON:', jsonError);
        return textContent as unknown as T;
      }
    } catch (textError) {
      console.error('Failed to read response as text:', textError);
      throw new Error('Failed to parse response: body may have been already read');
    }
  }
};

/**
 * Extract data from a response object safely
 */
export const extractResponseData = async <T>(response: Response): Promise<T> => {
  try {
    const parsedData = await safeJsonParse<{data: T}>(response);
    return parsedData.data;
  } catch (error) {
    console.error('Error extracting response data:', error);
    throw error;
  }
};

/**
 * Create a response object from cached data
 */
export const createResponseFromCachedData = (data: any): Response => {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
};

/**
 * Checks if the response is acceptable for the requested content type
 * Returns true if acceptable, false otherwise
 */
export const isAcceptableResponse = (response: Response, acceptHeader?: string): boolean => {
  // If no specific accept header is required, assume it's acceptable
  if (!acceptHeader) return true;
  
  const contentType = response.headers.get('Content-Type') || '';
  
  // If the accept header is a wildcard, any content type is acceptable
  if (acceptHeader === '*/*') return true;
  
  // Check if the response content type matches any of the accepted types
  const acceptedTypes = acceptHeader.split(',').map(type => type.trim());
  
  for (const type of acceptedTypes) {
    // Handle wildcards like 'application/*'
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -1); // Remove the asterisk
      if (contentType.startsWith(prefix)) {
        return true;
      }
    } else if (contentType.includes(type)) {
      return true;
    }
  }
  
  console.warn(`Content type mismatch: Received ${contentType}, but expected ${acceptHeader}`);
  return false;
};
