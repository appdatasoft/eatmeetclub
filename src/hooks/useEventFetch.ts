
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventDetails, EventDetailsResponse } from "./types/eventTypes";

export const useEventFetch = (eventId: string | undefined): EventDetailsResponse => {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  
  // Function to refresh event details
  const refreshEventDetails = async () => {
    if (!eventId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First get the current user (if logged in)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
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
      
      // Check if the current user is the owner of this event
      if (currentUserId && data.user_id === currentUserId) {
        setIsCurrentUserOwner(true);
      } else {
        setIsCurrentUserOwner(false);
      }
    } catch (err: any) {
      console.error("Error in useEventFetch:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshEventDetails();
  }, [eventId]);

  return {
    event,
    isLoading,
    error,
    isCurrentUserOwner,
    refreshEventDetails
  };
};
