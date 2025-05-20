
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const { eventId, quantity = 1, returnUrl, referralCode } = await req.json();

    // Verify the request
    if (!eventId) throw new Error("Event ID is required");
    if (quantity <= 0) throw new Error("Quantity must be greater than 0");
    if (!returnUrl) throw new Error("Return URL is required");

    // Get authenticated user
    const auth = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!auth) throw new Error("Missing auth token");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(auth);
    if (authError || !user) {
      throw new Error("Unauthorized: " + (authError?.message || "Invalid user"));
    }

    // Get the event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*, restaurant:restaurants(name)")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      throw new Error("Event not found: " + (eventError?.message || ""));
    }

    // Calculate the price details
    const unitPrice = Math.round(event.price * 100); // Convert to cents
    const subtotal = unitPrice * quantity;
    const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
    const total = subtotal + serviceFee;

    console.log("Creating payment for:", {
      eventId,
      quantity,
      unitPrice,
      subtotal,
      serviceFee,
      total,
      user: user.id,
      referralCode
    });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Ticket for ${event.title}`,
              description: `${event.restaurant.name} on ${new Date(event.date).toLocaleDateString()}`,
              images: event.cover_image ? [event.cover_image] : undefined,
            },
            unit_amount: unitPrice,
          },
          quantity: quantity,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Service Fee",
              description: "5% service fee",
            },
            unit_amount: Math.round(serviceFee / quantity), // Per ticket service fee
          },
          quantity: quantity,
        },
      ],
      client_reference_id: eventId,
      customer_email: user.email,
      mode: "payment",
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
      cancel_url: `${new URL(returnUrl).origin}/events/${eventId}?payment_cancelled=true`,
      metadata: {
        eventId,
        userId: user.id,
        quantity: quantity.toString(),
        referralCode: referralCode || "",
      },
    });

    console.log("Checkout session created:", {
      id: session.id,
      url: session.url,
      expiresAt: session.expires_at,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: session.url,
        sessionId: session.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error("Error creating ticket payment:", err);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message || "Failed to create payment session" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
