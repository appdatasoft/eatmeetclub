
// Fix for the body stream already read issue - we need to make sure we don't try to
// read the response body more than once
export const handleResponse = async (response: Response): Promise<Response> => {
  // If we get a 429 status code, throw an error to trigger retry logic
  if (response.status === 429) {
    throw new Error(`Rate limit hit (429)`);
  }
  
  // For other error statuses, let Supabase handle them
  return response;
};
