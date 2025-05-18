
import { useState, useEffect, useCallback } from "react";
import { supabase, retryFetch } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/types/event";
import { useEventDataFetch } from "./events/useEventDataFetch";
import { useEventOwnership } from "./events/useEventOwnership";

export const useEventFetching = (eventId?: string) => {
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use specialized hooks to fetch data and check ownership
  const { fetchEventWithDetails } = useEventDataFetch();
  const { checkOwnership, isCurrentUserOwner, setIsCurrentUserOwner } = useEventOwnership();

  const fetchEventDetails = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the event data with retry mechanism
      const eventData = await retryFetch(
        () => fetchEventWithDetails(eventId),
        3,  // max 3 retries
        1500 // starting delay of 1.5s
      );
      
      if (eventData) {
        setEvent(eventData);
        
        // Check if current user is the owner
        const isOwner = await checkOwnership(eventData.user_id);
        setIsCurrentUserOwner(isOwner);
      }
    } catch (error: any) {
      console.error("Error in fetchEventDetails:", error);
      setError(error.message || "Failed to load event details");
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
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
    error,
    loading,
    isCurrentUserOwner,
    fetchEventDetails,
    refreshEventDetails: fetchEventDetails
  };
};

export default useEventFetching;
