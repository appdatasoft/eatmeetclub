import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

// Initialize Stripe with the secret key from environment variable
export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16", // Use the latest Stripe API version
  httpClient: Stripe.createFetchHttpClient(),
});

// Common CORS headers for all Stripe-related functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

// Get the Stripe secret key, endpoint secret and other configuration
export const getStripeConfig = () => {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const endpointSecret = Deno.env.get("STRIPE_ENDPOINT_SECRET");
  const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
  
  if (!secretKey) {
    console.warn("STRIPE_SECRET_KEY not found in environment variables");
  }
  
  if (!endpointSecret) {
    console.warn("STRIPE_ENDPOINT_SECRET not found in environment variables");
  }
  
  return {
    secretKey,
    endpointSecret,
    publishableKey
  };
};

// Helper for handling OPTIONS preflight requests
export function handleCorsOptions() {
  return new Response(null, { headers: corsHeaders });
}

// Helper for creating JSON responses with CORS headers
export function createJsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

// Helper for creating error responses
export function createErrorResponse(error: unknown, status = 500) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("Error:", errorMessage);
  
  return createJsonResponse({
    error: errorMessage,
    success: false
  }, status);
}

// Helper function to safely parse JSON with fallback
export function safeJsonParse(text: string, fallback: any = null) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return fallback;
  }
}
