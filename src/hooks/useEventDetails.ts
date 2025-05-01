
import { useEventFetch } from "./eventDetails";
import { useEventPaymentHandler } from "./event-payment";
import { EventDetails } from "./types/eventTypes";

export type { EventDetails } from "./types/eventTypes";

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
