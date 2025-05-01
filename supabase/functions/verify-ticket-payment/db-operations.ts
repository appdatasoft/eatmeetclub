
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function checkExistingTickets(supabaseClient: any, sessionId: string, userId: string) {
  const { data: existingTickets, error: existingError } = await supabaseClient
    .from('tickets')
    .select('id, payment_status')
    .eq('payment_id', sessionId)
    .eq('user_id', userId);
    
  if (existingError) {
    console.error("Error checking existing tickets:", existingError);
  }
  
  return existingTickets;
}

export async function updateTicketRecord(supabaseClient: any, sessionId: string, userId: string) {
  const { data: ticketData, error: ticketError } = await supabaseClient
    .from('tickets')
    .update({ payment_status: 'completed' })
    .eq('payment_id', sessionId)
    .eq('user_id', userId)
    .select();
  
  if (ticketError) {
    console.error('Error updating ticket record:', ticketError);
    throw new Error('Failed to update ticket record');
  }
  
  return ticketData;
}

export async function incrementTicketsSold(supabaseClient: any, eventId: string, quantity: number) {
  const parsedQuantity = parseInt(quantity || '0');
  
  // Call the RPC function with parameters as separate arguments
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
}

export async function fetchEventDetails(supabaseClient: any, eventId: string) {
  const { data: eventData, error: eventFetchError } = await supabaseClient
    .from('events')
    .select('title, date, time, restaurant:restaurants(name, address, city, state)')
    .eq('id', eventId)
    .single();
    
  if (eventFetchError) {
    console.error('Error fetching event details for invoice:', eventFetchError);
  }
  
  return eventData;
}
