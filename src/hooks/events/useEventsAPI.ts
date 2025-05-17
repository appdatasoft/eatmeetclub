
import { fetchPublishedEventsWithSupabase, fetchPublishedEventsWithREST } from "./eventsApi";
import { mapToEventCardProps } from "./eventMappers";

export const useEventsAPI = () => {
  const fetchPublishedEvents = async () => {
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
    
    console.log("Raw events data:", rawEvents);
    
    // Transform data to match EventCardProps format
    const formattedEvents = mapToEventCardProps(rawEvents);
    console.log("Final formatted events:", formattedEvents);
    
    return formattedEvents;
  };
  
  return { fetchPublishedEvents };
};
