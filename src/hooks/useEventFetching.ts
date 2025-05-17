
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/types/event";
import { useEventDataFetch } from "./events/useEventDataFetch";
import { useEventOwnership } from "./events/useEventOwnership";

export const useEventFetching = (eventId?: string) => {
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Use specialized hooks to fetch data and check ownership
  const { fetchEventWithDetails } = useEventDataFetch();
  const { checkOwnership, isCurrentUserOwner, setIsCurrentUserOwner } = useEventOwnership();

  const fetchEventDetails = useCallback(async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      
      // Fetch the event data
      const eventData = await fetchEventWithDetails(eventId);
      
      if (eventData) {
        setEvent(eventData);
        
        // Check if current user is the owner
        const isOwner = await checkOwnership(eventData.user_id);
        setIsCurrentUserOwner(isOwner);
      }
    } catch (error) {
      console.error("Error in fetchEventDetails:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, fetchEventWithDetails, checkOwnership, toast, setIsCurrentUserOwner]);

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
