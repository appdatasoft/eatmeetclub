
import { useState, useEffect, useCallback } from "react";
import { EventDetails, EventDetailsResponse } from "../types/eventTypes";
import { toast } from "@/hooks/use-toast";
import { fetchEventDetails, checkEventOwnership } from "./eventDetailsFetcher";

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
      
      // Fetch the event details
      const eventDetails = await fetchEventDetails(eventId);
      setEvent(eventDetails);
      
      // Check if current user is the owner
      const isOwner = await checkEventOwnership(eventId);
      setIsCurrentUserOwner(isOwner);
    } catch (err: any) {
      console.error("Error in useEventFetch:", err);
      setError(err.message || "An unexpected error occurred");
      setEvent(null);
      
      // Only show toast for server errors, not for invalid IDs or not found
      if (err.message !== "Invalid event ID format" && err.message !== "Event not found") {
        toast({
          title: "Error loading event",
          description: err.message || "Failed to load event details",
          variant: "destructive"
        });
      }
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
