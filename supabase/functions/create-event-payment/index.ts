
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.18.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Create event payment function invoked");
    
    const body = await req.json();
    const { eventDetails } = body;
    
    console.log("Event details received:", JSON.stringify(eventDetails));
    
    // Create Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create admin client to fetch config
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? ""
    );

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      throw new Error("Invalid token or user not found");
    }
    
    console.log("User authenticated:", userData.user.id);

    // Get event creation fee from app_config
    const { data: configData, error: configError } = await supabaseAdmin
      .from("app_config")
      .select("value")
      .eq("key", "EVENT_CREATION_FEE")
      .single();
    
    if (configError) {
      console.error("Error fetching config:", configError);
    }
    
    // Default to 50 if config value cannot be fetched
    const EVENT_CREATION_FEE = configData ? parseFloat(configData.value) : 50;
    console.log("Event creation fee:", EVENT_CREATION_FEE);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    
    console.log("Stripe key type:", stripeKey.startsWith('sk_test_') ? 'TEST MODE' : 'LIVE MODE');
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    
    console.log("Stripe initialized, creating checkout session");

    // Calculate amount in cents (Stripe requires amount in smallest currency unit)
    const amount = Math.round(EVENT_CREATION_FEE * 100);

    // Create a payment session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Event Creation Fee",
              description: `Event Creation Fee for: ${eventDetails.title}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard/create-event`,
      metadata: {
        event_title: eventDetails.title,
        event_date: eventDetails.date,
        user_id: userData.user.id,
      },
    });
    
    console.log("Checkout session created:", session.id);
    console.log("Checkout URL:", session.url);

    // Store event details in localStorage to be accessed after payment
    const responseData = {
      url: session.url,
      sessionId: session.id,
      eventDetails: eventDetails,
      fee: EVENT_CREATION_FEE
    };

    console.log("Returning response with checkout URL:", session.url);
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Create payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
