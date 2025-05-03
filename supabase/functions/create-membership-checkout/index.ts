
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const stripeSecretTest = Deno.env.get("STRIPE_SECRET_KEY_TEST")!;
  const stripeSecretLive = Deno.env.get("STRIPE_SECRET_KEY_LIVE")!;
  const stripeMode = (await req.json())?.stripeMode || "test";

  const stripe = new Stripe(
    stripeMode === "live" ? stripeSecretLive : stripeSecretTest,
    { apiVersion: "2022-11-15" }
  );

  try {
    const body = await req.json();
    const {
      email,
      name,
      phone,
      address,
      amount,
      redirectToCheckout = true
    } = body;

    if (!email || !amount) {
      return new Response(JSON.stringify({ error: "Missing email or amount" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Eat Meet Club Membership" },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${Deno.env.get("SITE_URL")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("SITE_URL")}/become-member?cancelled=true`,
      metadata: {
        user_email: email
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode: stripeMode,
        url: redirectToCheckout ? session.url : null,
        sessionId: session.id
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Checkout session error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders
    });
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};
