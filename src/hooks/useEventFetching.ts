
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/types/event";

export const useEventFetching = (eventId?: string) => {
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      
      // First get the current user (if logged in)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
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
        
        setEvent({
          ...data,
          date: formattedDate,
          tickets_sold: ticketsSold
        });
        
        // Check if the current user is the owner of this event
        if (currentUserId && data.user_id === currentUserId) {
          setIsCurrentUserOwner(true);
        } else {
          setIsCurrentUserOwner(false);
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  return {
    event,
    loading,
    isCurrentUserOwner,
    fetchEventDetails,
    refreshEventDetails: fetchEventDetails
  };
};

export default useEventFetching;
