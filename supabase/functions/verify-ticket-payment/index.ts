
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
      console.error("Authentication error:", userError);
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
    
    // Check if there's already a completed ticket record to avoid duplication
    const { data: existingTickets, error: existingError } = await supabaseClient
      .from('tickets')
      .select('id, payment_status')
      .eq('payment_id', sessionId)
      .eq('user_id', userId);
      
    if (existingError) {
      console.error("Error checking existing tickets:", existingError);
    }
    
    // If we already have a completed ticket, return success without duplicating
    if (existingTickets && existingTickets.length > 0 && existingTickets[0].payment_status === 'completed') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          ticket: existingTickets[0],
          status: 'already_processed',
          message: 'Ticket payment was already processed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    const parsedQuantity = parseInt(quantity || '0');
    
    // Fixed: Call the RPC function directly with parameters as separate arguments
    const { error: eventError } = await supabaseClient.rpc(
      'increment_tickets_sold', 
      { 
        p_event_id: eventId,
        p_quantity: parsedQuantity
      }
    );
    
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
    
    let emailSent = false;
    // Send invoice email - but don't fail if email sending fails
    if (eventData && ticketData && ticketData.length > 0) {
      try {
        console.log(`Sending ticket invoice email for session ${sessionId} to ${user.email}`);
        
        // Get user's name from metadata
        const userName = user.user_metadata?.name || user.user_metadata?.full_name || 'Member';
        console.log(`User name for email: ${userName}`);
        
        // Use direct fetch to send email to avoid cross-function issues
        const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-invoice-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader
          },
          body: JSON.stringify({
            sessionId,
            email: user.email,
            name: userName,
            eventDetails: {
              ...eventData,
              ...ticketData[0],
              restaurant: eventData.restaurant
            }
          }),
        });
        
        console.log("Email API response status:", emailResponse.status);
        
        if (!emailResponse.ok) {
          const responseText = await emailResponse.text();
          console.error("Error response from invoice email function:", responseText);
          throw new Error(`Invoice email API returned error: ${responseText}`);
        } else {
          const responseData = await emailResponse.json();
          console.log("Email API response data:", responseData);
          emailSent = true;
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
        emailSent
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
