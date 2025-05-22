
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

  const { fetchPublishedEvents } = useEventsAPI();
  const { subscribeToEventChanges } = useEventSubscription();

  const areEventsEqual = (prevEvents: EventCardProps[], newEvents: EventCardProps[]): boolean => {
    if (prevEvents.length !== newEvents.length) return false;
    const prevIds = new Set(prevEvents.map(e => e.id));
    return newEvents.every(event => prevIds.has(event.id));
  };

  const refreshEvents = useCallback(async () => {
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
    };
  }, [refreshEvents]);

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = subscribeToEventChanges(() => {
        if (isMountedRef.current && initialLoadComplete.current) {
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
        description: "You may need to refresh the page to see new events.",
        variant: "default"
      });
    }

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Error during unsubscribe:", error);
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
