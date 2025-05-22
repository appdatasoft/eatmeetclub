
import { useState, useEffect, useCallback, useRef } from "react";
import { EventCardProps } from "@/components/events/EventCard";
import { useEventsAPI } from "./useEventsAPI";
import { useEventSubscription } from "./useEventSubscription";
import { useToast } from "@/hooks/use-toast";

export const useEvents = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasSubscriptionError, setHasSubscriptionError] = useState(false);
  const isMountedRef = useRef(true);
  const initialLoadComplete = useRef(false);
  const refreshIntervalRef = useRef<number | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const refreshCooldown = 5000; // 5 seconds cooldown between manual refreshes

  const { fetchPublishedEvents } = useEventsAPI();
  const { subscribeToEventChanges } = useEventSubscription();

  const areEventsEqual = (prevEvents: EventCardProps[], newEvents: EventCardProps[]): boolean => {
    if (prevEvents.length !== newEvents.length) return false;
    const prevIds = new Set(prevEvents.map(e => e.id));
    return newEvents.every(event => prevIds.has(event.id));
  };

  const refreshEvents = useCallback(async () => {
    const now = Date.now();
    
    // Prevent too frequent refreshes (except first load)
    if (initialLoadComplete.current && now - lastRefreshTimeRef.current < refreshCooldown) {
      console.log(`Skipping refresh - cooldown period (${Math.round((now - lastRefreshTimeRef.current) / 1000)}s)`);
      return;
    }
    
    lastRefreshTimeRef.current = now;
    
    if (!isMountedRef.current) return;

    try {
      setIsLoading(true);
      setFetchError(null);
      
      const newEvents = await fetchPublishedEvents();

      if (!isMountedRef.current) return;

      if (!newEvents || areEventsEqual(events, newEvents)) {
        console.log("No update needed");
        return;
      }

      setEvents(newEvents);
      console.log("Updated events list with new data");
      
      // Clear subscription error state if successful
      setHasSubscriptionError(false);
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      setFetchError(error.message || "Unknown error");
      console.error("Error fetching events:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        initialLoadComplete.current = true;
      }
    }
  }, [fetchPublishedEvents, events]);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial data fetch
    if (!initialLoadComplete.current) {
      refreshEvents();
    }

    return () => {
      isMountedRef.current = false;
      
      // Clear any intervals when component unmounts
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [refreshEvents]);

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = subscribeToEventChanges((error) => {
        if (error) {
          console.warn("Subscription error detected:", error);
          setHasSubscriptionError(true);
        } else if (isMountedRef.current && initialLoadComplete.current) {
          console.log("Event change detected via subscription");
          refreshEvents();
        }
      });
    } catch (error) {
      console.error("Failed to subscribe to event changes:", error);
      setHasSubscriptionError(true);
      
      // Show toast for subscription error (only once)
      toast({
        title: "Realtime Updates Unavailable",
        description: "Events will refresh periodically instead of in real-time.",
        variant: "default"
      });
    }
    
    // Set up polling as fallback regardless of subscription status
    // This ensures we always have a way to get updates if subscription fails silently
    if (!refreshIntervalRef.current && isMountedRef.current) {
      console.log("Setting up polling fallback for events");
      refreshIntervalRef.current = window.setInterval(() => {
        console.log("Polling for events updates");
        if (isMountedRef.current && initialLoadComplete.current) {
          refreshEvents();
        }
      }, 30000); // Poll every 30 seconds
    }

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Error during unsubscribe:", error);
      }
      
      // Clear interval on cleanup
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [subscribeToEventChanges, refreshEvents, toast]);

  return {
    events,
    isLoading,
    fetchError,
    hasSubscriptionError,
    refreshEvents,
  };
};

export default useEvents;
