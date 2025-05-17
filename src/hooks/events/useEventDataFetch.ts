import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "@/types/event";

export const useEventDataFetch = () => {
  const fetchEventWithDetails = async (eventId: string) => {
    try {
      console.log(`Fetching event details for ID: ${eventId}`);
      
      // Fetch event data with restaurant details
      const { data, error } = await supabase
        .from('events')
        .select('*, restaurants(*)')
        .eq('id', eventId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Fetch ticket data
      const { ticketsSold, ticketsError } = await fetchTicketsSold(eventId);
      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
      }
      
      // Format event data
      if (data) {
        return formatEventData(data, ticketsSold);
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching event details:", error);
      throw error;
    }
  };

  // Helper function to fetch tickets sold for the event
  const fetchTicketsSold = async (eventId: string) => {
    // Count tickets sold for this event
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('quantity')
      .eq('event_id', eventId)
      .eq('payment_status', 'completed');
      
    // Calculate total tickets sold
    let ticketsSold = 0;
    if (ticketsData && ticketsData.length > 0) {
      ticketsSold = ticketsData.reduce((total, ticket) => total + ticket.quantity, 0);
    }
    
    return { ticketsSold, ticketsError };
  };

  // Helper function to format event data
  const formatEventData = (data: any, ticketsSold: number): EventDetails => {
    // Format the date to a more readable format
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return {
      ...data,
      date: formattedDate,
      tickets_sold: ticketsSold
    } as EventDetails;
  };

  return { fetchEventWithDetails };
};
