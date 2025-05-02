
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    // Get the Stripe key from environment
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    
    // Check if it's a test key based on prefix
    const isTestMode = stripeKey.startsWith("sk_test_") || !stripeKey.startsWith("sk_live_");
    
    console.log("Stripe mode check:", isTestMode ? "test" : "live");
    
    return new Response(
      JSON.stringify({ isTestMode }),
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
