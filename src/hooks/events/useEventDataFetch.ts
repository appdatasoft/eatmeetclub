
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/types/event";

export const useEventDataFetch = (toast: ReturnType<typeof useToast>) => {
  const fetchEventWithDetails = async (eventId: string) => {
    try {
      console.log(`Fetching event details for ID: ${eventId}`);
      
      // Fetch event data with restaurant details
      const { data, error } = await supabase
        .from('events')
        .select('*, restaurant:restaurants(*)')
        .eq('id', eventId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Count tickets sold for this event
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('quantity')
        .eq('event_id', eventId)
        .eq('payment_status', 'completed');
        
      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
      }
      
      // Calculate total tickets sold
      let ticketsSold = 0;
      if (ticketsData && ticketsData.length > 0) {
        ticketsSold = ticketsData.reduce((total, ticket) => total + ticket.quantity, 0);
      }
      
      // Format the event data
      if (data) {
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
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching event details:", error);
      throw error;
    }
  };

  return { fetchEventWithDetails };
};
