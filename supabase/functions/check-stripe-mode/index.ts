
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Check if we're using test mode by testing a small part of the API key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const isTestMode = stripeKey.startsWith('sk_test_');
    
    console.log("Stripe mode check: using", isTestMode ? "test mode" : "live mode");

    return new Response(
      JSON.stringify({
        isTestMode,
        mode: isTestMode ? 'test' : 'live'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking Stripe mode:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        // Default to test mode if we can't determine
        isTestMode: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
