
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/types/event";
import { useEventDataFetch } from "./events/useEventDataFetch";
import { useEventOwnership } from "./events/useEventOwnership";
import { fetchWithRetry } from "@/utils/fetch";
import { createSessionCache } from "@/utils/fetch/sessionStorageCache";

export const useEventFetching = (eventId?: string) => {
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fetchAttempt, setFetchAttempt] = useState(0);

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
      setIsRetrying(true);
      
      // Create a session cache for this event
      const cacheKey = `event_details_${eventId}_${fetchAttempt}`;
      const cache = createSessionCache<EventDetails>(cacheKey, 5 * 60 * 1000, {
        staleWhileRevalidate: true
      });
      
      // Check for cached data first
      const cachedEvent = cache.get();
      if (cachedEvent) {
        console.log("Using cached event data");
        setEvent(cachedEvent);
        
        // Check if current user is the owner
        if (cachedEvent.user_id) {
          const isOwner = await checkOwnership(cachedEvent.user_id);
          setIsCurrentUserOwner(isOwner);
        }
        
        setLoading(false);
        setIsRetrying(false);
        
        // Background refresh if stale
        if (cache.isStale()) {
          setTimeout(() => refreshEventInBackground(eventId, cache, cachedEvent), 100);
        }
        
        return;
      }
      
      // Use the fetchWithRetry utility with our event fetching function
      const result = await fetchWithRetry(
        async () => {
          const data = await fetchEventWithDetails(eventId);
          if (!data.event) {
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
      
      if (result && result.event) {
        setEvent(result.event);
        // Cache the result
        cache.set(result.event);
        
        // Check if current user is the owner
        if (result.event.user_id) {
          const isOwner = await checkOwnership(result.event.user_id);
          setIsCurrentUserOwner(isOwner);
        }
      } else if (result && result.error) {
        setError(result.error);
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
  }, [eventId, fetchEventWithDetails, checkOwnership, toast, setIsCurrentUserOwner, fetchAttempt]);

  // Background refresh function for stale data
  const refreshEventInBackground = async (
    eventId: string,
    cache: ReturnType<typeof createSessionCache>,
    currentEvent: EventDetails
  ) => {
    try {
      console.log("Refreshing event details in background");
      const result = await fetchEventWithDetails(eventId);
      
      if (result && result.event) {
        // Only update if there are actual differences
        const hasChanged = JSON.stringify(result.event) !== JSON.stringify(currentEvent);
        
        if (hasChanged) {
          console.log("Background refresh found updated data");
          setEvent(result.event);
          cache.set(result.event);
        } else {
          console.log("Background refresh found no changes");
          // Update the cache expiry anyway
          cache.refresh();
        }
      }
    } catch (error) {
      console.error("Background refresh failed:", error);
      // Don't show UI errors for background refreshes
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  // Manual refresh function
  const refreshEventDetails = useCallback(() => {
    setFetchAttempt(prev => prev + 1);
  }, []);

  return {
    event,
    error,
    loading,
    isRetrying,
    isCurrentUserOwner,
    fetchEventDetails,
    refreshEventDetails
  };
};

export default useEventFetching;
