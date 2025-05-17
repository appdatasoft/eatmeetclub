import { useState, useEffect, useCallback, useRef } from "react";
import { EventCardProps } from "@/components/events/EventCard";
import { useEventsAPI } from "./useEventsAPI";
import { useEventSubscription } from "./useEventSubscription";

const deepEqual = (a: any, b: any): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const useEvents = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const { fetchPublishedEvents } = useEventsAPI(); // ensure it's memoized
  const { subscribeToEventChanges } = useEventSubscription();

  const refreshEvents = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setIsLoading(true);
      setFetchError(null);
      const newEvents = await fetchPublishedEvents();

      if (isMountedRef.current && !deepEqual(newEvents, events)) {
        setEvents(newEvents);
        console.log("Updated events list");
      } else {
        console.log("No change in event data, skipping update");
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        setFetchError(error.message || "Unknown error");
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [fetchPublishedEvents, events]);

  useEffect(() => {
    isMountedRef.current = true;

    refreshEvents(); // initial load

    const unsubscribe = subscribeToEventChanges(() => {
      if (isMountedRef.current) refreshEvents();
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [refreshEvents, subscribeToEventChanges]);

  return {
    events,
    isLoading,
    fetchError,
    refreshEvents,
  };
};

export default useEvents;
