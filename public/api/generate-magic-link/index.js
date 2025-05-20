
// This file ensures that the /api/generate-magic-link route is properly mapped
// to the Supabase Edge Function with the same name
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  // Get the Supabase URL from environment or use the hardcoded fallback
  const supabaseUrl = process.env.SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co";
  
  // Construct the URL for the Supabase Edge Function
  const functionUrl = `${supabaseUrl}/functions/v1/generate-magic-link`;
  
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Forwarding request to Supabase Edge Function: ${functionUrl}`);
    
    // Get the request body
    let requestBody = null;
    if (req.method !== 'OPTIONS' && req.method !== 'GET') {
      const clone = req.clone();
      requestBody = await clone.text();
      console.log(`[${timestamp}] Request body: ${requestBody}`);
    }
    
    // Set up request options for forwarding
    let requestOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      }
    };
    
    // Only add body for non-GET/OPTIONS requests
    if (req.method !== 'OPTIONS' && req.method !== 'GET' && requestBody) {
      requestOptions.body = requestBody;
    }
    
    // Forward the request to the Supabase Edge Function
    const response = await fetch(functionUrl, requestOptions);
    
    if (!response.ok) {
      console.error(`[${timestamp}] Edge function returned error status: ${response.status}`);
      const responseText = await response.text();
      console.error(`[${timestamp}] Error response body: ${responseText}`);
      throw new Error(`Edge function failed with status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log(`[${timestamp}] Response from edge function: ${responseText}`);
    
    // Return the response from the Edge Function with proper CORS headers
    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error forwarding request to edge function:`, error);
    
    // Return a more descriptive error message
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "Failed to forward request to Supabase edge function",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}
