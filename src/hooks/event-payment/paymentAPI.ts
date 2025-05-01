
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "../types/eventTypes";

/**
 * Creates a payment session for ticket purchases
 * @param token Auth token for the API call
 * @param event Event details
 * @param ticketCount Number of tickets to purchase
 * @param serviceFee Service fee calculated for the purchase
 * @param totalAmount Total amount to be charged
 */
export const createTicketPaymentSession = async (
  token: string,
  event: EventDetails,
  ticketCount: number,
  serviceFee: number,
  totalAmount: number
) => {
  console.log("Creating payment session for event:", event.id);
  
  // Prepare ticket purchase data
  const purchaseData = {
    eventId: event.id,
    quantity: ticketCount,
    unitPrice: event.price,
    serviceFee: serviceFee,
    totalAmount: totalAmount
  };
  
  // Create payment session with Stripe
  const response = await supabase.functions.invoke('create-ticket-payment', {
    body: { purchaseData },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  console.log("Payment session response:", response);
  
  if (response.error) {
    throw new Error(response.error.message || "Failed to create payment session");
  }
  
  if (!response.data?.url) {
    throw new Error("No checkout URL returned from payment service");
  }
  
  return response.data.url;
};
