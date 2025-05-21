
import { fetchPublishedEventsWithSupabase, fetchPublishedEventsWithREST } from "./api";
import { mapToEventCardProps } from "./eventMappers";
import { useRef, useState } from "react";
import { EventCardProps } from "@/components/events/EventCard";

export const useEventsAPI = () => {
  const [isFetching, setIsFetching] = useState(false);
  const fetchPromiseRef = useRef<Promise<EventCardProps[]> | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const cacheDuration = 60000; // Increased to 60 seconds cache to reduce network calls
  const cachedEventsRef = useRef<EventCardProps[] | null>(null);

  const fetchPublishedEvents = async () => {
    const now = Date.now();
    
    // If we have cached data and it's still fresh, return it immediately
    if (cachedEventsRef.current && now - lastFetchTimeRef.current < cacheDuration) {
      console.log("Using cached events data, age:", (now - lastFetchTimeRef.current) / 1000, "seconds");
      return cachedEventsRef.current;
    }
    
    // If we're already fetching data, return the existing promise
    if (isFetching && fetchPromiseRef.current) {
      console.log("Already fetching events, returning existing promise");
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
          cachedEventsRef.current = [];
          return [];
        }
        
        console.log(`Raw events data: ${rawEvents.length} events found`);
        
        // Transform data to match EventCardProps format
        const formattedEvents = mapToEventCardProps(rawEvents);
        console.log(`Final formatted events: ${formattedEvents.length} events`);
        
        // Update the cache with new data
        cachedEventsRef.current = formattedEvents;
        
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
