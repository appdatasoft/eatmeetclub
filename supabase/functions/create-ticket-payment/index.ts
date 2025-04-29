
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
    const { purchaseData } = await req.json();
    const { eventId, quantity, unitPrice, serviceFee, totalAmount } = purchaseData;

    if (!eventId || !quantity || !unitPrice) {
      return new Response(
        JSON.stringify({ error: 'Missing required purchase information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('title, tickets_sold, capacity')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there are enough tickets available
    const ticketsAvailable = event.capacity - (event.tickets_sold || 0);
    if (quantity > ticketsAvailable) {
      return new Response(
        JSON.stringify({ error: `Only ${ticketsAvailable} tickets available` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log information for debugging
    console.log(`Creating payment session for user ${user.id}, event ${eventId}, quantity ${quantity}`);

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
      success_url: `${req.headers.get('origin')}/ticket-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/event/${eventId}`,
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
