
// check-stripe-mode.tsx
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";

    const isSecretTest = stripeSecretKey.startsWith("sk_test_");
    const isPublishableTest = stripePublishableKey.startsWith("pk_test_");
    const isTestMode = isSecretTest || isPublishableTest;

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
    console.error("Stripe mode verification failed:", error.message);

    return new Response(
      JSON.stringify({
        isTestMode: true,
        error: "Stripe mode verification failed. Using default test mode.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
