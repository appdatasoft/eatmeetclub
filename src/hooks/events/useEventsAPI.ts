
import { fetchPublishedEventsWithSupabase, fetchPublishedEventsWithREST } from "./eventsApi";
import { mapToEventCardProps } from "./eventMappers";
import { useRef, useState } from "react";

export const useEventsAPI = () => {
  const [isFetching, setIsFetching] = useState(false);
  const fetchPromiseRef = useRef<Promise<any> | null>(null);

  const fetchPublishedEvents = async () => {
    // If already fetching, return the existing promise
    if (isFetching && fetchPromiseRef.current) {
      console.log("Already fetching events, returning existing promise");
      return fetchPromiseRef.current;
    }
    
    try {
      setIsFetching(true);
      
      // Create a new fetch promise
      fetchPromiseRef.current = (async () => {
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
      fetchPromiseRef.current = null;
    }
  };
  
  return { fetchPublishedEvents };
};
