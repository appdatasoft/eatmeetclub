import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchEventDetails, checkEventOwnership } from "./eventDetails/eventDetailsFetcher";
import { getUserFriendlyEventError } from "./eventDetails/errorHandler";
import { EventDetails, EventDetailsResponse } from "../types/eventTypes";

export const useEventFetch = (eventId: string | undefined): EventDetailsResponse => {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);

  const refreshEventDetails = useCallback(async () => {
    if (!eventId) {
      setError("No event ID provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      console.warn("⚠️ Safety timeout triggered");
      setIsLoading(false);
      if (!event && !error) {
        setError("Request timed out. Please try again.");
      }
    }, 10000);

    try {
      const eventDetails = await fetchEventDetails(eventId);
      setEvent(eventDetails);

      try {
        const isOwner = await checkEventOwnership(eventId);
        setIsCurrentUserOwner(isOwner);
      } catch (ownershipError) {
        console.warn("Ownership check failed or skipped");
        setIsCurrentUserOwner(false);
      }

      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error("Error in useEventFetch:", err);
      setEvent(null);
      setError(err.message || "An unexpected error occurred");

      if (
        err.message !== "Invalid event ID format" &&
        err.message !== "Event not found"
      ) {
        toast({
          title: "Error loading event",
          description: getUserFriendlyEventError(err),
          variant: "destructive",
        });
      }

      clearTimeout(timeoutId);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]); // ✅ Only include eventId

  useEffect(() => {
    refreshEventDetails();
  }, [refreshEventDetails]);

  return {
    event,
    isLoading,
    error,
    isCurrentUserOwner,
    refreshEventDetails,
  };
};
