
import { fetchPublishedEventsWithSupabase, fetchPublishedEventsWithREST } from "./eventsApi";
import { mapToEventCardProps } from "./eventMappers";
import { useState } from "react";

export const useEventsAPI = () => {
  const [isFetching, setIsFetching] = useState(false);

  const fetchPublishedEvents = async () => {
    // Prevent concurrent fetches
    if (isFetching) {
      console.log("Already fetching events, skipping duplicate request");
      return [];
    }
    
    try {
      setIsFetching(true);
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
    } finally {
      setIsFetching(false);
    }
  };
  
  return { fetchPublishedEvents };
};
