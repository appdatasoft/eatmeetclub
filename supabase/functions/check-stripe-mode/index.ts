
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control, pragma, expires",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";

    const isTestSecret = stripeSecretKey.startsWith("sk_test_");
    const isTestPublic = stripePublishableKey.startsWith("pk_test_");
    const isTestMode = isTestSecret || isTestPublic;

    console.log("Stripe mode status:", {
      secretKeyPrefix: stripeSecretKey.substring(0, 8),
      publicKeyPrefix: stripePublishableKey.substring(0, 8),
      isTestMode,
      matched: isTestSecret === isTestPublic
    });

    return new Response(
      JSON.stringify({
        isTestMode,
        stripePublishableKey,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Stripe mode check failed:", error.message);
    return new Response(
      JSON.stringify({
        isTestMode: true,
        error: "Stripe mode verification failed. Using default test mode.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // don't crash frontend
      }
    );
  }
});
