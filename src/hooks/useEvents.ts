
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { EventCardProps } from "@/components/events/EventCard";

export const useEvents = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPublishedEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      console.log("Fetching published events...");
      
      let data = null;
      let error = null;
      
      try {
        // First attempt with supabase client query
        console.log("Attempting to fetch events with Supabase client...");
        const response = await supabase
          .from('events')
          .select(`
            id, 
            title, 
            date, 
            time, 
            price, 
            capacity,
            cover_image,
            published,
            user_id,
            restaurant_id,
            restaurant:restaurants(name, city, state)
          `)
          .eq('published', true)
          .order('date', { ascending: true });
          
        if (response.error) {
          console.error("Supabase client query error:", response.error);
          error = response.error;
        } else {
          data = response.data;
          console.log("Events fetched successfully with Supabase client:", data?.length || 0, "events");
        }
      } catch (clientError) {
        console.error("Error in Supabase client approach:", clientError);
        error = clientError;
      }
      
      // If first attempt failed, try direct fetch approach
      if (!data && error) {
        console.log("First attempt failed. Trying direct REST API approach...");
        
        try {
          // Use a direct REST API call as fallback
          const publicUrl = `https://wocfwpedauuhlrfugxuu.supabase.co/rest/v1/events?select=id,title,date,time,price,capacity,cover_image,published,user_id,restaurant_id,restaurant:restaurants(name,city,state)&published=eq.true&order=date.asc`;
          
          console.log("Fetching from public URL:", publicUrl);
          
          const response = await fetch(publicUrl, {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2Z3cGVkYXV1aGxyZnVneHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjIzNzAsImV4cCI6MjA2MTM5ODM3MH0.ddkNFmDcRtkPA6ubax7_GJxGQ6oNvbmsZ_FTY9DuzhM',
              'Content-Type': 'application/json'
            },
            method: 'GET'
          });
          
          if (!response.ok) {
            console.error("REST API response status:", response.status);
            throw new Error(`REST API request failed with status: ${response.status}`);
          }
          
          const responseData = await response.json();
          console.log("REST API response data:", responseData);
          
          if (Array.isArray(responseData)) {
            data = responseData;
            error = null;
          } else {
            console.error("Unexpected response format:", responseData);
            throw new Error("Unexpected response format from REST API");
          }
        } catch (fetchError: any) {
          console.error("Error in REST API fetch attempt:", fetchError);
          error = fetchError;
        }
      }
        
      if (error) {
        console.error("All attempts to fetch events failed:", error);
        setFetchError("Failed to load events. Please try again later.");
        setEvents([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No events found in database");
        setEvents([]);
        return;
      }
      
      console.log("Raw events data:", data);
      
      // Transform data to match EventCardProps format
      const formattedEvents: EventCardProps[] = data.map((event: any) => {
        // Determine meal type based on time
        const eventTime = event.time;
        let category: "breakfast" | "lunch" | "dinner" = "dinner";
        
        if (eventTime) {
          const hour = parseInt(eventTime.split(':')[0]);
          if (hour < 11) {
            category = "breakfast";
          } else if (hour < 16) {
            category = "lunch";
          }
        }
        
        // Format date from YYYY-MM-DD to Month Day, Year
        let formattedDate = event.date;
        try {
          const dateObj = new Date(event.date);
          formattedDate = format(dateObj, "MMMM d, yyyy");
        } catch (e) {
          console.error("Error formatting date:", e, "for date:", event.date);
        }
        
        // Format time from 24h to 12h format
        let formattedTime = event.time;
        try {
          const timeParts = event.time.split(':');
          let hours = parseInt(timeParts[0]);
          const minutes = timeParts[1];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          formattedTime = `${hours}:${minutes} ${ampm}`;
        } catch (e) {
          console.error("Error formatting time:", e, "for time:", event.time);
        }
        
        const location = event.restaurant 
          ? `${event.restaurant.city}, ${event.restaurant.state}` 
          : "";
          
        const eventProps = {
          id: event.id,
          title: event.title || "Untitled Event",
          restaurantName: event.restaurant ? event.restaurant.name : "Restaurant",
          restaurantId: event.restaurant_id,
          date: formattedDate,
          time: formattedTime,
          price: Number(event.price) || 0,
          image: event.cover_image || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
          category,
          location,
          userId: event.user_id
        };
        
        console.log("Formatted event:", eventProps);
        return eventProps;
      });
      
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
