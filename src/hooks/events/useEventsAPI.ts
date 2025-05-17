
import { fetchPublishedEventsWithSupabase, fetchPublishedEventsWithREST } from "./eventsApi";
import { mapToEventCardProps } from "./eventMappers";
import { useRef, useState } from "react";
import { EventCardProps } from "@/components/events/EventCard";

export const useEventsAPI = () => {
  const [isFetching, setIsFetching] = useState(false);
  const fetchPromiseRef = useRef<Promise<EventCardProps[]> | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const cacheDuration = 30000; // 30 seconds cache

  const fetchPublishedEvents = async () => {
    const now = Date.now();
    
    // If we recently fetched data and have a cached promise, return it
    if (isFetching && fetchPromiseRef.current) {
      console.log("Already fetching events, returning existing promise");
      return fetchPromiseRef.current;
    }
    
    // Implement request debouncing
    if (now - lastFetchTimeRef.current < cacheDuration && fetchPromiseRef.current) {
      console.log("Using cached events data");
      return fetchPromiseRef.current;
    }
    
    try {
      setIsFetching(true);
      lastFetchTimeRef.current = now;
      
      // Create a new fetch promise
      fetchPromiseRef.current = (async () => {
        let rawEvents = null;
        
        // First try with Supabase client
        try {
          console.log("Fetching events with Supabase client");
          rawEvents = await fetchPublishedEventsWithSupabase();
        } catch (clientError) {
          console.error("Error in Supabase client approach:", clientError);
          
          // Try with REST API as fallback
          try {
            console.log("Falling back to direct REST API");
            rawEvents = await fetchPublishedEventsWithREST();
          } catch (fetchError: any) {
            console.error("Error in REST API fetch attempt:", fetchError);
            throw fetchError;
          }
        }
        
        if (!rawEvents || rawEvents.length === 0) {
          console.log("No events found in database");
          return [];
        }
        
        console.log(`Raw events data: ${rawEvents.length} events found`);
        
        // Transform data to match EventCardProps format
        const formattedEvents = mapToEventCardProps(rawEvents);
        console.log(`Final formatted events: ${formattedEvents.length} events`);
        
        return formattedEvents;
      })();
      
      // Return the result of the promise
      return await fetchPromiseRef.current;
    } finally {
      setIsFetching(false);
    }
  };
  
  return { fetchPublishedEvents };
};
