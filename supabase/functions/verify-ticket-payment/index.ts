
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, verifyTicketSession, sendInvoiceEmail } from "./utils.ts";
import { 
  checkExistingTickets, 
  updateTicketRecord, 
  incrementTicketsSold,
  fetchEventDetails
} from "./db-operations.ts";

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

    // Verify the session with Stripe
    const { session, metadata } = await verifyTicketSession(sessionId);
    
    // Extract metadata
    const { eventId, userId, quantity } = metadata;
    
    // Verify that the user ID matches the authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if there's already a completed ticket record to avoid duplication
    const existingTickets = await checkExistingTickets(supabaseClient, sessionId, userId);
    
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
    const ticketData = await updateTicketRecord(supabaseClient, sessionId, userId);
    
    // Update the tickets_sold count in the events table
    await incrementTicketsSold(supabaseClient, eventId, quantity);
    
    // Fetch event and user details for the invoice email
    const eventData = await fetchEventDetails(supabaseClient, eventId);
      
    let emailSent = false;
    // Send invoice email - but don't fail if email sending fails
    if (eventData && ticketData && ticketData.length > 0) {
      emailSent = await sendInvoiceEmail(authHeader, sessionId, user, eventData, ticketData[0]);
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
