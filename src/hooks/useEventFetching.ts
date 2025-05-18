
import { useState, useEffect, useCallback } from "react";
import { supabase, retryFetch } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/types/event";
import { useEventDataFetch } from "./events/useEventDataFetch";
import { useEventOwnership } from "./events/useEventOwnership";
import { fetchWithRetry } from "@/utils/fetchUtils";

export const useEventFetching = (eventId?: string) => {
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Use specialized hooks to fetch data and check ownership
  const { fetchEventWithDetails } = useEventDataFetch();
  const { checkOwnership, isCurrentUserOwner, setIsCurrentUserOwner } = useEventOwnership();

  const fetchEventDetails = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    
    if (isRetrying) return; // Prevent multiple simultaneous retries
    
    try {
      setLoading(true);
      setError(null);
      
      // Add a retry flag to prevent UI flashing during retries
      setIsRetrying(true);
      
      // Fetch the event data with retry mechanism and exponential backoff
      const eventData = await fetchWithRetry(
        () => fetchEventWithDetails(eventId),
        {
          retries: 5,
          baseDelay: 1000,
          maxDelay: 15000
        }
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
      setIsRetrying(false);
    }
  }, [eventId, fetchEventWithDetails, checkOwnership, toast, setIsCurrentUserOwner]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  return {
    event,
    error,
    loading,
    isRetrying,
    isCurrentUserOwner,
    fetchEventDetails,
    refreshEventDetails: fetchEventDetails
  };
};

export default useEventFetching;
