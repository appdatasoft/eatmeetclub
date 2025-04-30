
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  restaurant: {
    id?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    description: string;
  };
  tickets_sold?: number;
  user_id: string;
  cover_image?: string;
  published: boolean;
}

export const useEventDetails = (eventId: string | undefined) => {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setError("No event ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from("events")
          .select(`
            *,
            restaurants (
              id,
              name,
              address,
              city,
              state,
              zipcode,
              description
            )
          `)
          .eq("id", eventId)
          .single();

        if (fetchError) {
          console.error("Error fetching event details:", fetchError);
          setError("Failed to load event details");
          return;
        }

        if (!data) {
          setError("Event not found");
          return;
        }

        // Transform the data to match the EventDetails interface
        const eventDetails: EventDetails = {
          id: data.id,
          title: data.title,
          description: data.description || "",
          date: data.date,
          time: data.time,
          price: data.price,
          capacity: data.capacity,
          restaurant: {
            id: data.restaurants?.id,
            name: data.restaurants?.name || "Unknown Restaurant",
            address: data.restaurants?.address || "",
            city: data.restaurants?.city || "",
            state: data.restaurants?.state || "",
            zipcode: data.restaurants?.zipcode || "",
            description: data.restaurants?.description || "",
          },
          tickets_sold: data.tickets_sold || 0,
          user_id: data.user_id,
          cover_image: data.cover_image,
          published: data.published,
        };

        setEvent(eventDetails);
      } catch (err: any) {
        console.error("Error in useEventDetails:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  return {
    event,
    isLoading,
    error,
  };
};
