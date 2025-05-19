
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
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
      
      // Use the fetchWithRetry utility with our event fetching function
      const eventData = await fetchWithRetry(
        async () => {
          const data = await fetchEventWithDetails(eventId);
          if (!data) {
            throw new Error("Event not found");
          }
          return data;
        },
        {
          retries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          shouldRetry: (error) => {
            // Only retry network errors or 500 errors
            return error.message !== "Event not found";
          }
        }
      );
      
      if (eventData) {
        setEvent(eventData);
        
        // Check if current user is the owner
        if (eventData.user_id) {
          const isOwner = await checkOwnership(eventData.user_id);
          setIsCurrentUserOwner(isOwner);
        }
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
