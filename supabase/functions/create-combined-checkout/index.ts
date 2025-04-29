
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { stripe } from "../_shared/stripe.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with auth context from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { eventId, ticketQuantity, ticketUnitPrice } = await req.json();

    if (!eventId || !ticketQuantity || !ticketUnitPrice) {
      return new Response(
        JSON.stringify({ error: 'Missing required purchase information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('title, tickets_sold, capacity, published')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if event is published
    if (!event.published) {
      return new Response(
        JSON.stringify({ error: 'Event is not available for ticket purchases' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there are enough tickets available
    const ticketsAvailable = event.capacity - (event.tickets_sold || 0);
    if (ticketQuantity > ticketsAvailable) {
      return new Response(
        JSON.stringify({ error: `Only ${ticketsAvailable} tickets available` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate ticket service fee (5% of ticket price)
    const ticketServiceFee = ticketUnitPrice * ticketQuantity * 0.05;
    const ticketTotal = (ticketUnitPrice * ticketQuantity) + ticketServiceFee;
    
    // Membership fee (fixed at $25)
    const membershipFee = 2500; // $25.00 in cents
    
    // Log information for debugging
    console.log(`Creating combined checkout for user ${user.id}, event ${eventId}, tickets ${ticketQuantity}, membership`);

    // Create a Stripe Checkout Session with both membership and ticket
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        // Membership subscription
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Monthly Membership',
              description: 'Monthly membership subscription',
            },
            unit_amount: membershipFee,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
        // Event ticket
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ticket for ${event.title}`,
              description: `${ticketQuantity} ticket(s) at $${ticketUnitPrice.toFixed(2)} each`,
            },
            unit_amount: Math.round(ticketUnitPrice * 100), // Stripe uses cents
          },
          quantity: ticketQuantity,
        },
        // Service fee
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Service Fee',
              description: '5% service fee for tickets',
            },
            unit_amount: Math.round(ticketServiceFee * 100 / ticketQuantity), // Stripe uses cents
          },
          quantity: ticketQuantity,
        },
      ],
      mode: 'subscription', // Use subscription mode to enable recurring payment for membership
      success_url: `${req.headers.get('origin')}/ticket-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/event/${eventId}`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        eventId,
        userId: user.id,
        ticketQuantity,
        ticketUnitPrice,
        ticketServiceFee,
        ticketTotal,
        membershipFee: membershipFee / 100, // Store in dollars for readability
        isCombinedCheckout: 'true',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    // Create a pending ticket record in the database
    const { data: ticketData, error: ticketError } = await supabaseClient
      .from('tickets')
      .insert([
        {
          user_id: user.id,
          event_id: eventId,
          quantity: ticketQuantity,
          price: ticketUnitPrice,
          service_fee: ticketServiceFee,
          total_amount: ticketTotal,
          payment_id: session.id,
          payment_status: 'pending'
        }
      ]);

    if (ticketError) {
      console.error('Error creating ticket record:', ticketError);
      // Continue anyway as the payment might still be processed
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
