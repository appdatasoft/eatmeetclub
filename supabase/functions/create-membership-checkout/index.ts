
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");

    if (!jwt) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: { headers: { Authorization: `Bearer ${jwt}` } }
      }
    );

    const { email, name, phone, address, stripeMode = "test", amount = 25.0 } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripeKey = stripeMode === "live"
      ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
      : Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });

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
      success_url: `${Deno.env.get("SITE_URL")}/membership-payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("SITE_URL")}/membership-payment?canceled=true`,
      metadata: {
        user_email: email,
        user_name: name || "",
        phone: phone || "",
        address: address || ""
      }
    });

    return new Response(JSON.stringify({
      success: true,
      url: session.url,
      sessionId: session.id
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : "Unknown error",
      details: err.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
