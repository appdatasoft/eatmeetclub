
// This file ensures that the /api/generate-magic-link route is properly mapped
// to the Supabase Edge Function with the same name
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const supabaseUrl = process.env.SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co";
  
  // Construct the URL for the Supabase Edge Function
  const functionUrl = `${supabaseUrl}/functions/v1/generate-magic-link`;
  
  try {
    console.log("Forwarding request to Supabase Edge Function:", functionUrl);
    
    // Get the request body for logging
    let requestBody = null;
    if (req.method !== 'GET') {
      const clone = req.clone();
      requestBody = await clone.text();
      console.log("Request body:", requestBody);
    }
    
    // Forward the request to the Supabase Edge Function
    const response = await fetch(functionUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: req.method !== 'GET' ? await req.text() : undefined,
    });
    
    const responseText = await response.text();
    console.log("Response from edge function:", responseText);
    
    // Return the response from the Edge Function
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
    console.error("Error forwarding request to edge function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
