
import { useState, useEffect, useCallback } from "react";
import { EventDetails, EventDetailsResponse } from "./types/eventTypes";
import { toast } from "@/hooks/use-toast";
import { fetchEventDetails, checkEventOwnership } from "./eventDetails/eventDetailsFetcher";
import { getUserFriendlyEventError } from "./eventDetails/errorHandler";

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
      
      // Add a reasonable timeout to prevent infinite loading state
      const timeoutId = setTimeout(() => {
        console.log("Safety timeout triggered - forcing loading state to end");
        setIsLoading(false);
        if (!event && !error) {
          setError("Request timed out. Please try again.");
        }
      }, 10000); // 10 seconds timeout
      
      // Fetch the event details
      const eventDetails = await fetchEventDetails(eventId);
      setEvent(eventDetails);
      
      // Check if current user is the owner
      const isOwner = await checkEventOwnership(eventId);
      setIsCurrentUserOwner(isOwner);
      
      // Clear timeout as request completed successfully
      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error("Error in useEventFetch:", err);
      setError(err.message || "An unexpected error occurred");
      setEvent(null);
      
      // Only show toast for server errors, not for invalid IDs or not found
      if (err.message !== "Invalid event ID format" && err.message !== "Event not found") {
        toast({
          title: "Error loading event",
          description: getUserFriendlyEventError(err),
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [eventId, event, error]);

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
