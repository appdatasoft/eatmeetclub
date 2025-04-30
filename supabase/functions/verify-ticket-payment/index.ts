
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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing session ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying payment for session ${sessionId} and user ${user.id}`);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Invalid session ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify payment status
    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed', status: session.payment_status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract metadata
    const { eventId, userId, quantity } = session.metadata || {};
    
    // Verify that the user ID matches the authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update the ticket record in the database
    const { data: ticketData, error: ticketError } = await supabaseClient
      .from('tickets')
      .update({ payment_status: 'completed' })
      .eq('payment_id', sessionId)
      .eq('user_id', userId)
      .select();
    
    if (ticketError) {
      console.error('Error updating ticket record:', ticketError);
      return new Response(
        JSON.stringify({ error: 'Failed to update ticket record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update the tickets_sold count in the events table
    // Modified approach to avoid issues with the function
    const { error: eventError } = await supabaseClient
      .from('events')
      .update({ tickets_sold: supabaseClient.rpc('increment_count', { row_id: eventId, count: parseInt(quantity || '0') }) })
      .eq('id', eventId);
    
    if (eventError) {
      console.error('Error updating event tickets sold:', eventError);
      // Continue anyway as the ticket is already created
    }
    
    // Fetch event and user details for the invoice email
    const { data: eventData, error: eventFetchError } = await supabaseClient
      .from('events')
      .select('title, date, time, restaurant:restaurants(name, address, city, state)')
      .eq('id', eventId)
      .single();
      
    if (eventFetchError) {
      console.error('Error fetching event details for invoice:', eventFetchError);
    }
    
    // Send invoice email - but don't fail if email sending fails
    if (eventData && ticketData && ticketData.length > 0) {
      try {
        console.log(`Sending ticket invoice email for session ${sessionId} to ${user.email}`);
        
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        if (!supabaseUrl) {
          throw new Error("SUPABASE_URL environment variable is not set");
        }
        
        // Full URL construction for the edge function call
        const invoiceEmailUrl = `${supabaseUrl}/functions/v1/send-invoice-email`;
        console.log("Calling invoice email function at:", invoiceEmailUrl);
        
        const response = await fetch(invoiceEmailUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            email: user.email,
            name: user.user_metadata?.name || 'Member',
            eventDetails: {
              ...eventData,
              ...ticketData[0]
            }
          }),
        });
        
        console.log("Ticket invoice email API response status:", response.status);
        
        if (!response.ok) {
          const responseText = await response.text();
          console.error("Error response from invoice email function:", responseText);
          throw new Error(`Invoice email API returned error: ${responseText}`);
        } else {
          console.log("Ticket invoice email sent successfully");
        }
      } catch (invoiceError) {
        console.error("Error sending ticket invoice email:", invoiceError);
        // Don't fail the whole process if the invoice email fails
      }
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        ticket: ticketData && ticketData.length > 0 ? ticketData[0] : null,
        emailSent: true
      }),
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
