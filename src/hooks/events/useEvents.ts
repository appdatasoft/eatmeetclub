
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventCardProps } from "@/components/events/EventCard";
import { fetchPublishedEventsWithSupabase, fetchPublishedEventsWithREST } from "./eventsApi";
import { mapToEventCardProps } from "./eventMappers";

export const useEvents = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPublishedEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      console.log("Fetching published events...");
      
      let rawEvents = null;
      
      // First try with Supabase client
      try {
        rawEvents = await fetchPublishedEventsWithSupabase();
      } catch (clientError) {
        console.error("Error in Supabase client approach:", clientError);
        
        // Try with REST API as fallback
        try {
          rawEvents = await fetchPublishedEventsWithREST();
        } catch (fetchError: any) {
          console.error("Error in REST API fetch attempt:", fetchError);
          throw fetchError;
        }
      }
      
      if (!rawEvents || rawEvents.length === 0) {
        console.log("No events found in database");
        setEvents([]);
        return;
      }
      
      console.log("Raw events data:", rawEvents);
      
      // Transform data to match EventCardProps format
      const formattedEvents = mapToEventCardProps(rawEvents);
      
      console.log("Final formatted events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (error: any) {
      console.error("Unexpected error fetching published events:", error);
      setFetchError(`An unexpected error occurred: ${error.message}`);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPublishedEvents();

    // Add a subscription to listen for changes in the events table
    const channel = supabase
      .channel('public:events')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'events'
      }, (payload) => {
        console.log('Events table changed:', payload);
        fetchPublishedEvents();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPublishedEvents]);

  return {
    events,
    isLoading,
    fetchError,
    refreshEvents: fetchPublishedEvents
  };
};

export default useEvents;
