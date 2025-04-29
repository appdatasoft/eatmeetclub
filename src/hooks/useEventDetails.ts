
import { useEventFetching } from "./useEventFetching";
import { useEventPayments } from "./useEventPayments";

export type { EventDetails } from "@/types/event";

export const useEventDetails = (eventId?: string) => {
  const { 
    event, 
    loading, 
    isCurrentUserOwner, 
    refreshEventDetails 
  } = useEventFetching(eventId);
  
  const { 
    isPaymentProcessing, 
    handleBuyTickets: processTicketPurchase 
  } = useEventPayments();

  // Wrapper to ensure we're passing the event to the payment handler
  const handleBuyTickets = (ticketCount: number) => {
    processTicketPurchase(event, ticketCount);
  };

  return {
    event,
    loading,
    isPaymentProcessing,
    isCurrentUserOwner,
    handleBuyTickets,
    refreshEventDetails
  };
};

export default useEventDetails;
