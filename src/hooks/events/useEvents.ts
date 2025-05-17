
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
  const refreshInProgressRef = useRef(false);

  const { fetchPublishedEvents } = useEventsAPI();
  const { subscribeToEventChanges } = useEventSubscription();

  // Function to check if two arrays of events are equal
  const areEventsEqual = (prevEvents: EventCardProps[], newEvents: EventCardProps[]): boolean => {
    if (prevEvents.length !== newEvents.length) return false;
    
    // Compare by id for faster comparison
    const prevIds = new Set(prevEvents.map(e => e.id));
    return newEvents.every(event => prevIds.has(event.id));
  };

  const refreshEvents = useCallback(async () => {
    if (!isMountedRef.current || refreshInProgressRef.current) {
      console.log("Skipping refresh - component unmounted or refresh already in progress");
      return;
    }

    try {
      refreshInProgressRef.current = true;
      setIsLoading(prevIsLoading => !initialLoadComplete.current || prevIsLoading);
      setFetchError(null);
      
      console.log("Refreshing events data...");
      const newEvents = await fetchPublishedEvents();

      if (isMountedRef.current) {
        // Only update state if events have actually changed
        if (!areEventsEqual(events, newEvents)) {
          setEvents(newEvents);
          console.log("Updated events list with new data");
        } else {
          console.log("No change in event data, skipping update");
        }
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        console.error("Error refreshing events:", error);
        setFetchError(error.message || "Unknown error");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        initialLoadComplete.current = true;
        refreshInProgressRef.current = false;
      }
    }
  }, [fetchPublishedEvents, events]);

  // Separate effect for initial load
  useEffect(() => {
    console.log("Initial setup of events hook");
    isMountedRef.current = true;
    
    // Only load on initial mount
    if (!initialLoadComplete.current) {
      console.log("Performing initial events load");
      refreshEvents();
    }
    
    return () => {
      console.log("Cleaning up events hook");
      isMountedRef.current = false;
    };
  }, [refreshEvents]);
  
  // Separate effect for subscription - only set up once
  useEffect(() => {
    console.log("Setting up events subscription");
    
    const unsubscribe = subscribeToEventChanges(() => {
      if (isMountedRef.current && initialLoadComplete.current && !refreshInProgressRef.current) {
        console.log("Event change detected via subscription, triggering refresh");
        refreshEvents();
      }
    });

    return () => {
      console.log("Removing events subscription");
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
