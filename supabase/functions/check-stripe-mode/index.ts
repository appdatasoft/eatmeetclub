
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
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
    // Get both Stripe keys from environment
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
    
    // Check if it's a test key based on prefix
    const isSecretTestMode = stripeSecretKey.startsWith("sk_test_");
    const isPublishableTestMode = stripePublishableKey.startsWith("pk_test_");
    
    // Both keys should be in the same mode (test or live)
    const isTestMode = isSecretTestMode || isPublishableTestMode;
    
    // Log keys partially for debugging (only first few chars)
    const secretKeyPrefix = stripeSecretKey.substring(0, 8) + "...";
    const publishableKeyPrefix = stripePublishableKey.substring(0, 8) + "...";
    
    console.log("Stripe mode check:", { 
      isTestMode, 
      secretKeyPrefix,
      publishableKeyPrefix,
      secretKeyMatch: isSecretTestMode === isPublishableTestMode ? "matching" : "mismatched" 
    });
    
    return new Response(
      JSON.stringify({ 
        isTestMode,
        publishableKeyPrefix 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking Stripe mode:", error.message);
    
    // Default to test mode in case of errors
    return new Response(
      JSON.stringify({ 
        isTestMode: true,
        error: "Error determining Stripe mode, defaulting to test mode."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 even for errors to prevent client-side crashes
      }
    );
  }
});
