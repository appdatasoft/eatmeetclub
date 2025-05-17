
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventCardProps } from "@/components/events/EventCard";
import { useEventsAPI } from "./useEventsAPI";
import { useEventSubscription } from "./useEventSubscription";

export const useEvents = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const { fetchPublishedEvents } = useEventsAPI();
  const { subscribeToEventChanges } = useEventSubscription();

  const refreshEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      console.log("Fetching published events...");
      
      const formattedEvents = await fetchPublishedEvents();
      setEvents(formattedEvents || []);
      
    } catch (error: any) {
      console.error("Unexpected error fetching published events:", error);
      setFetchError(`An unexpected error occurred: ${error.message}`);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPublishedEvents]);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialEvents = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        
        const formattedEvents = await fetchPublishedEvents();
        
        if (isMounted) {
          setEvents(formattedEvents || []);
        }
      } catch (error: any) {
        if (isMounted) {
          console.error("Error fetching published events:", error);
          setFetchError(`An unexpected error occurred: ${error.message}`);
          setEvents([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchInitialEvents();
    
    // Add subscription to event changes
    const unsubscribe = subscribeToEventChanges(() => {
      if (isMounted) {
        refreshEvents();
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchPublishedEvents, subscribeToEventChanges]);

  return {
    events,
    isLoading,
    fetchError,
    refreshEvents
  };
};

export default useEvents;
