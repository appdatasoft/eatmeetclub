
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get the Stripe publishable key from environment variables
    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    
    if (!stripePublishableKey) {
      throw new Error("STRIPE_PUBLISHABLE_KEY is not set in environment variables");
    }

    // Determine if we're in test mode based on the key prefix
    const isTestMode = stripePublishableKey.startsWith("pk_test_");
    
    console.log("Retrieved Stripe publishable key successfully", {
      isTestMode,
      keyPrefix: stripePublishableKey.substring(0, 10) + "..." // Log only the prefix for security
    });
    
    return new Response(
      JSON.stringify({
        key: stripePublishableKey,
        isTestMode
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error retrieving Stripe publishable key:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "Failed to retrieve Stripe publishable key",
        isTestMode: true // Default to test mode on error for safety
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
