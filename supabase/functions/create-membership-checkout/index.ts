
// supabase/functions/create-membership-checkout/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";
import { userOperations } from "./user-operations.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY_TEST")!;
  const stripeLiveKey = Deno.env.get("STRIPE_SECRET_KEY_LIVE")!;

  try {
    const body = await req.json();
    const {
      email,
      name,
      phone,
      address,
      amount,
      stripeMode = "test",
      redirectToCheckout,
      createMembershipRecord,
      createUser = true,
      sendPasswordEmail = true
    } = body;

    if (!email || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Handle user creation if requested
    if (createUser) {
      await userOperations.findOrCreateUser(
        supabase, 
        email, 
        name, 
        phone, 
        address, 
        sendPasswordEmail
      );
    }

    const stripe = new Stripe(stripeMode === "live" ? stripeLiveKey : stripeSecretKey, {
      apiVersion: "2022-11-15"
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
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
      mode: "payment",
      success_url: `${Deno.env.get("SITE_URL")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("SITE_URL")}/become-member?cancelled=true`
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode: stripeMode,
        url: redirectToCheckout ? session.url : undefined
      }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (err) {
    console.error("create-membership-checkout error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
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
