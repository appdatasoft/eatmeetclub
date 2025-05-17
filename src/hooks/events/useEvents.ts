
import { useState, useEffect, useCallback, useRef } from "react";
import { EventCardProps } from "@/components/events/EventCard";
import { useEventsAPI } from "./useEventsAPI";
import { useEventSubscription } from "./useEventSubscription";

export const useEvents = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  
  const { fetchPublishedEvents } = useEventsAPI();
  const { subscribeToEventChanges } = useEventSubscription();

  const refreshEvents = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      setFetchError(null);
      console.log("Fetching published events...");
      
      const formattedEvents = await fetchPublishedEvents();
      
      if (isMountedRef.current) {
        setEvents(formattedEvents || []);
      }
    } catch (error: any) {
      console.error("Unexpected error fetching published events:", error);
      if (isMountedRef.current) {
        setFetchError(`An unexpected error occurred: ${error.message}`);
        setEvents([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchPublishedEvents]);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    const fetchInitialEvents = async () => {
      await refreshEvents();
    };
    
    fetchInitialEvents();
    
    // Add subscription to event changes
    const unsubscribe = subscribeToEventChanges(() => {
      if (isMountedRef.current) {
        refreshEvents();
      }
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
    refreshEvents
  };
};

export default useEvents;
