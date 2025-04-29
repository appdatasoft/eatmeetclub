
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
      
      // 1. First try with auth. This will establish an anonymous session if the user is not logged in
      let { data, error } = await supabase
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
          restaurant:restaurants(name, city, state)
        `)
        .eq('published', true)
        .order('date', { ascending: true });
      
      // 2. If there's an error (likely due to RLS), try with public access as a fallback
      if (error) {
        console.error("First attempt error:", error);
        console.log("Trying alternative query approach...");
        
        // Try again with a REST API call using the correct way to access URL and key
        const publicUrl = `https://wocfwpedauuhlrfugxuu.supabase.co/rest/v1/events?select=id,title,date,time,price,capacity,cover_image,published,restaurant:restaurants(name,city,state)&published=eq.true&order=date.asc`;
        
        const response = await fetch(publicUrl, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2Z3cGVkYXV1aGxyZnVneHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjIzNzAsImV4cCI6MjA2MTM5ODM3MH0.ddkNFmDcRtkPA6ubax7_GJxGQ6oNvbmsZ_FTY9DuzhM',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Alternative query failed with status: ${response.status}`);
        }
        
        data = await response.json();
        error = null;
      }
        
      if (error) {
        console.error("Error fetching events:", error);
        setFetchError("Failed to load events. Please try again later.");
        setEvents([]);
        return;
      }
      
      console.log("Events data received:", data);
      
      if (!data || data.length === 0) {
        console.log("No events found");
        setEvents([]);
        return;
      }
      
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
          console.error("Error formatting date:", e);
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
          console.error("Error formatting time:", e);
        }
        
        const location = event.restaurant 
          ? `${event.restaurant.city}, ${event.restaurant.state}` 
          : "";
        
        return {
          id: event.id,
          title: event.title,
          restaurantName: event.restaurant ? event.restaurant.name : "Restaurant",
          date: formattedDate,
          time: formattedTime,
          price: Number(event.price), // Ensure price is a number
          image: event.cover_image || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
          category,
          location
        };
      });
      
      console.log("Formatted events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching published events:", error);
      setFetchError("An unexpected error occurred. Please try again later.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPublishedEvents();

    // Add a subscription to listen for changes in the events table
    // This ensures that the events list is updated when events are published
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
