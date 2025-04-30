
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventDetails, EventDetailsResponse } from "./types/eventTypes";
import { toast } from "@/hooks/use-toast";

export const useEventFetch = (eventId: string | undefined): EventDetailsResponse => {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  
  // Function to refresh event details
  const refreshEventDetails = useCallback(async () => {
    if (!eventId) {
      setError("No event ID provided");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching event details for ID:", eventId);
      
      // First get the current user (if logged in)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      console.log("Current user ID:", currentUserId);
      
      const { data, error: fetchError } = await supabase
        .from("events")
        .select(`
          *,
          restaurant:restaurants (
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
        setError(fetchError.message || "Failed to load event details");
        return;
      }

      if (!data) {
        setError("Event not found");
        return;
      }
      
      console.log("Event data received:", data);

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
          id: data.restaurant?.id,
          name: data.restaurant?.name || "Unknown Restaurant",
          address: data.restaurant?.address || "",
          city: data.restaurant?.city || "",
          state: data.restaurant?.state || "",
          zipcode: data.restaurant?.zipcode || "",
          description: data.restaurant?.description || "",
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
      
      toast({
        title: "Error loading event",
        description: err.message || "Failed to load event details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refreshEventDetails();
  }, [refreshEventDetails]);

  return {
    event,
    isLoading,
    error,
    isCurrentUserOwner,
    refreshEventDetails
  };
};
