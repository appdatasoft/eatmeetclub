
import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Ticket } from "../types";

export const useEventTickets = () => {
  const { toast } = useToast();
  const [eventTickets, setEventTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const fetchTicketsForEvent = async (eventId: string) => {
    if (eventTickets.length > 0) {
      return; // Already fetched tickets for this event
    }
    
    try {
      setTicketsLoading(true);
      
      // Fetch tickets for the event
      const { data: ticketsData, error } = await supabase
        .from('tickets')
        .select('*, user:user_id(email)')
        .eq('event_id', eventId)
        .eq('payment_status', 'completed');
      
      if (error) throw error;
      
      // Format tickets data for display
      const formattedTickets = ticketsData.map((ticket: any) => ({
        ...ticket,
        user_email: ticket.user?.email,
        purchase_date: format(new Date(ticket.purchase_date), 'MMM d, yyyy h:mm a')
      }));
      
      setEventTickets(formattedTickets);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load ticket information",
        variant: "destructive"
      });
    } finally {
      setTicketsLoading(false);
    }
  };

  return {
    eventTickets,
    ticketsLoading,
    fetchTicketsForEvent
  };
};
