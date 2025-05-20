
/**
 * Helper functions for handling event-related errors
 */

/**
 * Format error messages in a user-friendly way
 */
export const formatEventErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  return String(error || 'Unknown error');
};

/**
 * Check if an error is a "not found" error
 */
export const isNotFoundError = (error: unknown): boolean => {
  const errorMessage = formatEventErrorMessage(error);
  return errorMessage.includes('not found') || 
         errorMessage.includes('Invalid event ID') ||
         errorMessage.includes('does not exist');
};

/**
 * Check if an error is a connection error
 */
export const isConnectionError = (error: unknown): boolean => {
  const errorMessage = formatEventErrorMessage(error);
  return errorMessage.includes('connect') || 
         errorMessage.includes('network') ||
         errorMessage.includes('timeout') ||
         errorMessage.includes('fetch');
};

/**
 * Get a user-friendly error message
 */
export const getUserFriendlyEventError = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';
  
  const errorMessage = formatEventErrorMessage(error);
  
  if (isNotFoundError(errorMessage)) {
    return 'The event you\'re looking for may have been removed or doesn\'t exist.';
  }
  
  if (isConnectionError(errorMessage)) {
    return 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.';
  }
  
  if (errorMessage.includes('body stream already read')) {
    return 'There was a problem loading the data. Please refresh the page and try again.';
  }
  
  if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
    return 'You don\'t have permission to view this event.';
  }
  
  // Return the original error message if we don't have a friendly version
  return errorMessage;
};
