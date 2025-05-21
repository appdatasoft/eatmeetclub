
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";
import { userOperations } from "./user-operations.ts";

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
    const { email, name, phone, address, restaurantId } = await req.json();
    
    // Get auth context - optional as this can also be used without auth
    let userId = null;
    const authHeader = req.headers.get("Authorization");

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email", success: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!restaurantId) {
      return new Response(JSON.stringify({ error: "Missing restaurantId", success: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if restaurant exists
    const { data: restaurantData, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq("id", restaurantId)
      .single();
      
    if (restaurantError || !restaurantData) {
      return new Response(JSON.stringify({ error: "Restaurant not found", success: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If auth header is present, verify the user
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && userData?.user) {
        userId = userData.user.id;
        console.log("Authenticated user:", userId);
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2022-11-15",
    });

    const siteUrl = Deno.env.get("SITE_URL")!;
    const loginUrl = `${siteUrl}/login`;

    // Fetch admin config values
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

    // Check if user exists in auth system
    const { data: existingUser, error: userError } = await supabase
      .from("auth.users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    // Get or create customer in Stripe
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name,
        phone,
        address: address ? { line1: address } : undefined
      });
      customerId = customer.id;
    }
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${siteUrl}/membership-confirmed?success=true&session_id={CHECKOUT_SESSION_ID}&restaurant_id=${restaurantId}`,
      cancel_url: `${siteUrl}/signup?canceled=true`,
      metadata: {
        user_email: email,
        user_name: name,
        phone,
        address,
        restaurant_id: restaurantId
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
