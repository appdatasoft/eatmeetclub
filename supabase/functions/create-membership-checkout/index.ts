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
    const { email, name, phone } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2022-11-15" });

    const siteUrl = Deno.env.get("SITE_URL")!;
    const loginUrl = `${siteUrl}/login`;

    // 1. Fetch membership fee and Stripe price ID from admin_config
    const configKeys = ["membership_fee", "stripe_price_id"];
    const { data: configData, error: configError } = await supabase
      .from("admin_config")
      .select("key, value")
      .in("key", configKeys);

    if (configError || !configData) {
      throw new Error("Missing or unreadable admin_config");
    }

    const config = Object.fromEntries(configData.map((row) => [row.key, row.value]));
    const membershipFee = parseInt(config["membership_fee"] || "2500", 10);
    const stripePriceId = config["stripe_price_id"];

    if (!stripePriceId) throw new Error("Stripe price ID not set in admin_config");

    // 2. Check if user exists
    // Use the listUsers method instead of getUserByEmail
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Failed to fetch users: ${userError.message}`);
    }
    
    // Find user by email
    const existingUser = users.users.find(user => user.email === email);

    // New User Flow
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, phone, membership_active: false },
      });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      if (newUser?.user) {
        await supabase.auth.admin.inviteUserByEmail(email);
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        line_items: [{ price: stripePriceId, quantity: 1 }],
        success_url: `${siteUrl}/membership-confirmed?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/membership-payment?canceled=true`,
      });

      return new Response(JSON.stringify({ success: true, url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Existing User Flow
    const metadata = existingUser?.user_metadata || {};
    const membershipActive = metadata.membership_active === true;

    if (membershipActive) {
      return new Response(JSON.stringify({ redirect: loginUrl, success: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate prorated amount (example logic: 50% if past 15th)
    const today = new Date().getDate();
    const proratedAmount = today > 15 ? Math.round(membershipFee / 2) : membershipFee;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Prorated Monthly Membership",
              description: "Partial month membership fee",
            },
            unit_amount: proratedAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/membership-confirmed?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/membership-payment?canceled=true`,
      metadata: {
        user_email: email,
        user_name: name,
        phone,
      },
    });

    return new Response(JSON.stringify({ success: true, url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ create-membership-checkout error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unexpected error",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
