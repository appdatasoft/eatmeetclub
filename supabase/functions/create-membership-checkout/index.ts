
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      email,
      name,
      phone,
      address,
      stripeMode = "test",
      amount = 25.0
    } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL");
    if (!siteUrl?.startsWith("http")) {
      return new Response(
        JSON.stringify({ error: "SITE_URL must begin with http or https" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase admin client (no auth required)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Select Stripe key
    const stripeKey = stripeMode === "live"
      ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
      : Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe key not configured", success: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Eat Meet Club Membership",
              description: "Monthly membership fee",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/membership-confirmed?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/membership-payment?canceled=true`,
      metadata: {
        user_email: email,
        user_name: name || "",
        phone: phone || "",
        address: address || "",
      },
    });

    // Create Supabase user via admin API
    const { error: createUserError } = await supabase.auth.admin.createUser({
      email,
      user_metadata: { name, phone, address },
      email_confirm: true,
    });

    // Send password setup email
    if (!createUserError) {
      await supabase.auth.admin.inviteUserByEmail(email);
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url,
        sessionId: session.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("❌ Error creating checkout session:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
        details: err.toString(),
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
