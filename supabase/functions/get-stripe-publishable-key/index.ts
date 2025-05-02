
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
    // Get the Stripe publishable key from environment variables
    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    
    if (!stripePublishableKey) {
      throw new Error("STRIPE_PUBLISHABLE_KEY is not set in environment variables");
    }

    console.log("Retrieved Stripe publishable key successfully");
    
    return new Response(
      JSON.stringify({
        publishableKey: stripePublishableKey
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
        message: "Failed to retrieve Stripe publishable key"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
