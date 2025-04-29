
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
    const { purchaseData } = await req.json();
    const { eventId, quantity, unitPrice } = purchaseData;
    
    if (!eventId || !quantity || !unitPrice) {
      throw new Error("Missing required purchase information");
    }

    console.log("Processing ticket purchase:", { eventId, quantity, unitPrice });
    
    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create Supabase admin client to bypass RLS if needed
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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
    
    // Fetch event details to confirm it exists and is valid
    const { data: eventData, error: eventError } = await supabaseClient
      .from("events")
      .select("title, price, restaurant_id")
      .eq("id", eventId)
      .single();
    
    if (eventError || !eventData) {
      throw new Error("Event not found or no longer available");
    }

    // Fetch the restaurant details
    const { data: restaurantData, error: restaurantError } = await supabaseClient
      .from("restaurants")
      .select("name")
      .eq("id", eventData.restaurant_id)
      .single();
      
    if (restaurantError) {
      console.error("Error fetching restaurant:", restaurantError);
    }
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Calculate total amount with service fee
    const subtotal = quantity * unitPrice;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const totalAmount = Math.round((subtotal + serviceFee) * 100); // Convert to cents for Stripe

    // Check if user already has a Stripe customer ID
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Using existing customer:", customerId);
    }

    // Create a Stripe checkout session
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userData.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Tickets for ${eventData.title}`,
              description: `${quantity} ticket(s) at ${restaurantData?.name || 'Restaurant'}`,
            },
            unit_amount: Math.round(unitPrice * 100), // Convert to cents
          },
          quantity: quantity,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Service Fee",
              description: "5% processing fee",
            },
            unit_amount: Math.round(serviceFee * 100 / quantity), // Per ticket service fee in cents
          },
          quantity: quantity,
        }
      ],
      mode: "payment",
      success_url: `${origin}/ticket-success?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
      cancel_url: `${origin}/event/${eventId}`,
      metadata: {
        eventId,
        userId: userData.user.id,
        quantity,
        unitPrice: unitPrice.toString(),
      },
    });

    console.log("Checkout session created:", { id: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
