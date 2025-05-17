import { useState, useEffect, useCallback, useRef } from "react";
import { EventCardProps } from "@/components/events/EventCard";
import { useEventsAPI } from "./useEventsAPI";
import { useEventSubscription } from "./useEventSubscription";

export const useEvents = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
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

      if (!newEvents || areEventsEqual(events, newEvents)) {
        console.log("No update needed");
        return;
      }

      if (isMountedRef.current) {
        setEvents(newEvents);
        console.log("Updated events list with new data");
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        setFetchError(error.message || "Unknown error");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        initialLoadComplete.current = true;
      }
    }
  }, [fetchPublishedEvents, events]); // ✅ Fixed dependency list

  useEffect(() => {
    isMountedRef.current = true;

    if (!initialLoadComplete.current) {
      refreshEvents();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshEvents]);

  useEffect(() => {
    const unsubscribe = subscribeToEventChanges(() => {
      if (isMountedRef.current && initialLoadComplete.current) {
        console.log("Event change detected via subscription");
        refreshEvents();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToEventChanges, refreshEvents]);

  return {
    events,
    isLoading,
    fetchError,
    refreshEvents,
  };
};

export default useEvents;
