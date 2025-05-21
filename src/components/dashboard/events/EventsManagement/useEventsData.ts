
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "./types";

export const useEventsData = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("events")
        .select(`
          id, 
          title, 
          date, 
          price, 
          capacity,
          tickets_sold,
          published,
          payment_status,
          restaurant_id,
          restaurants(name)
        `)
        .order('date', { ascending: true });

      if (error) throw error;

      // Transform the data to match our Event type structure
      const formattedEvents: Event[] = (data || []).map(item => {
        // Define default restaurant name
        let restaurantName = 'Unknown';
        
        // Check if restaurants property exists and extract name safely
        if (item.restaurants) {
          // Handle object form
          if (typeof item.restaurants === 'object' && !Array.isArray(item.restaurants)) {
            restaurantName = item.restaurants.name || 'Unknown';
          }
          // Handle array form (but this shouldn't happen in this query)
          else if (Array.isArray(item.restaurants) && item.restaurants.length > 0 && 
                  typeof item.restaurants[0] === 'object' && item.restaurants[0] !== null) {
            restaurantName = item.restaurants[0].name || 'Unknown';
          }
        }

        return {
          id: item.id,
          title: item.title,
          date: item.date,
          restaurant: {
            name: restaurantName
          },
          price: item.price,
          capacity: item.capacity,
          tickets_sold: item.tickets_sold || 0,
          published: item.published || false,
          payment_status: item.payment_status || 'pending',
          restaurant_id: item.restaurant_id
        };
      });

      setEvents(formattedEvents);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      setError(error.message || "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    isLoading,
    error,
    fetchEvents
  };
};
