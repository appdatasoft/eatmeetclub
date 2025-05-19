
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function for more detailed logging
function logPaymentStep(step: string, details: any = {}) {
  console.log(`[PAYMENT] [${new Date().toISOString()}] ${step}:`, JSON.stringify(details));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logPaymentStep("Ticket payment function called");
    
    // Create Supabase client with auth context from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logPaymentStep("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with admin privileges
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the user from the auth context
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      logPaymentStep("Authentication error", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logPaymentStep("Authenticated user", { userId: user.id, email: user.email });

    // Parse request body
    const requestData = await req.json();
    logPaymentStep("Request payload received", requestData);
    
    const { purchaseData } = requestData;
    if (!purchaseData) {
      logPaymentStep("Missing purchaseData in request");
      return new Response(
        JSON.stringify({ error: 'Missing purchase data' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { eventId, quantity } = purchaseData;

    logPaymentStep("Processing purchase data", purchaseData);

    if (!eventId || !quantity) {
      logPaymentStep("Missing required fields", { eventId, quantity });
      return new Response(
        JSON.stringify({ error: 'Missing required purchase information' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify event exists
    logPaymentStep("Fetching event details", { eventId });
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('title, tickets_sold, capacity, price')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      logPaymentStep("Event not found", { error: eventError?.message });
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logPaymentStep("Event found", event);

    // Check if there are enough tickets available
    const ticketsAvailable = event.capacity - (event.tickets_sold || 0);
    if (quantity > ticketsAvailable) {
      logPaymentStep("Insufficient tickets", { available: ticketsAvailable, requested: quantity });
      return new Response(
        JSON.stringify({ error: `Only ${ticketsAvailable} tickets available` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Stripe with the secret key from environment variable
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logPaymentStep("Missing Stripe secret key");
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Stripe key' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16", // Use the latest Stripe API version
      httpClient: Stripe.createFetchHttpClient(),
    });

    logPaymentStep("Creating Stripe checkout session");

    // Get origin URL safely
    let origin = req.headers.get('origin');
    if (!origin) {
      // Fallback to referrer if origin is not available
      const referrer = req.headers.get('referer');
      if (referrer) {
        try {
          const url = new URL(referrer);
          origin = `${url.protocol}//${url.host}`;
        } catch (e) {
          logPaymentStep("Failed to parse referrer", { error: e.message });
          origin = 'https://eatmeetclub.lovable.app';
        }
      } else {
        // Last resort fallback
        origin = 'https://eatmeetclub.lovable.app';
      }
    }
    
    logPaymentStep("Origin for redirect URLs", { origin });
    
    // Calculate pricing
    const unitPrice = event.price;
    const subtotal = unitPrice * quantity;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const totalAmount = subtotal + serviceFee;
    
    logPaymentStep("Price calculation", { 
      unitPrice, 
      quantity,
      subtotal,
      serviceFee,
      totalAmount
    });

    try {
      // Create a Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Ticket for ${event.title}`,
                description: `${quantity} ticket(s) at $${unitPrice.toFixed(2)} each`,
              },
              unit_amount: Math.round(unitPrice * 100), // Stripe uses cents
            },
            quantity: quantity,
          },
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Service Fee',
                description: '5% service fee',
              },
              unit_amount: Math.round((serviceFee / quantity) * 100), // Stripe uses cents
            },
            quantity: quantity,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/ticket-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/event/${eventId}`,
        client_reference_id: user.id,
        customer_email: user.email,
        metadata: {
          eventId,
          userId: user.id,
          quantity,
          unitPrice,
          serviceFee,
          totalAmount
        },
      });

      logPaymentStep("Checkout session created", { 
        sessionId: session.id,
        checkoutUrl: session.url
      });

      // Create a pending ticket record in the database
      const { data: ticketData, error: ticketError } = await supabaseClient
        .from('tickets')
        .insert([
          {
            user_id: user.id,
            event_id: eventId,
            quantity: quantity,
            price: unitPrice,
            service_fee: serviceFee,
            total_amount: totalAmount,
            payment_id: session.id,
            payment_status: 'pending'
          }
        ]);

      if (ticketError) {
        logPaymentStep('Error creating ticket record', ticketError);
      } else {
        logPaymentStep('Ticket record created successfully', { ticketId: ticketData });
      }

      // Return the checkout URL with explicit content type header
      logPaymentStep('Returning checkout URL to client', { url: session.url });
      return new Response(
        JSON.stringify({ 
          url: session.url,
          sessionId: session.id 
        }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          } 
        }
      );
    } catch (stripeError) {
      logPaymentStep("Stripe error", { 
        error: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      });
      return new Response(
        JSON.stringify({ error: `Stripe error: ${stripeError.message}` }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
  } catch (error) {
    logPaymentStep('Error in create-ticket-payment function', { 
      message: error.message,
      stack: error.stack
    });
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        } 
      }
    );
  }
});
