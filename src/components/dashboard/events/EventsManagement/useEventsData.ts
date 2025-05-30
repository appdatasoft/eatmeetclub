
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "./types";
import { extractRestaurantData } from "@/hooks/events/utils/restaurantDataUtils";

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
        // Extract restaurant name using our utility function
        const restaurantData = extractRestaurantData(item.restaurants);

        return {
          id: item.id,
          title: item.title,
          date: item.date,
          restaurant: {
            name: restaurantData.name
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
