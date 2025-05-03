
import { useEventFetch } from "./eventDetails";
import { useEventPaymentHandler } from "./event-payment";
import { EventDetails } from "./types/eventTypes";
import { useMembershipStatus } from "./useMembershipStatus";

export type { EventDetails } from "./types/eventTypes";
export { useMembershipStatus };

/**
 * Main hook for accessing event details and related functionality
 * 
 * @param eventId The ID of the event to fetch
 * @returns Object containing event data and related functions
 */
export const useEventDetails = (eventId: string | undefined) => {
  const { 
    event, 
    isLoading, 
    error, 
    isCurrentUserOwner,
    refreshEventDetails 
  } = useEventFetch(eventId);
  
  const { isPaymentProcessing, handleBuyTickets } = useEventPaymentHandler(event);

  return {
    event,
    isLoading,
    error,
    isCurrentUserOwner,
    isPaymentProcessing,
    handleBuyTickets,
    refreshEventDetails
  };
};
