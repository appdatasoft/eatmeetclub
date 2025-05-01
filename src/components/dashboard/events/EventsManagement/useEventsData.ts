
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
          restaurant:restaurants(name)
        `)
        .order('date', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
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
