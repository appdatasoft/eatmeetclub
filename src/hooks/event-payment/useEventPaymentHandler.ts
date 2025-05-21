
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EventDetails } from "@/types/event";
import { createTicketPayment } from "./paymentAPI";
import { usePaymentConfig } from "@/hooks/usePaymentConfig";

export interface EventPaymentHandlerResponse {
  isPaymentProcessing: boolean;
  handleBuyTickets: (ticketCount: number, affiliateId?: string) => Promise<void>;
}

export const useEventPaymentHandler = (
  event: EventDetails | null
): EventPaymentHandlerResponse => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: paymentConfig } = usePaymentConfig();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handleBuyTickets = async (ticketCount: number, affiliateId?: string) => {
    if (!event) {
      toast({
        title: "Error",
        description: "Event details not available",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      // Store event ID and ticket count in local storage for post-login redirect
      localStorage.setItem('pendingTicketPurchase', JSON.stringify({
        eventId: event.id,
        ticketCount: ticketCount,
        affiliateId: affiliateId, // Store affiliate ID if available
        redirectPath: `/event/${event.id}`
      }));
      
      // Redirect to login page with return path
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tickets",
        variant: "default"
      });
      
      navigate('/login', { state: { from: `/event/${event.id}` } });
      return;
    }

    try {
      setIsPaymentProcessing(true);
      
      // Get service fee percentage from config or use default 5%
      const serviceFeePercent = paymentConfig?.serviceFeePercent || 5;
      
      // Calculate service fee (configured % of total)
      const unitPrice = event.price;
      const subtotal = unitPrice * ticketCount;
      const serviceFee = subtotal * (serviceFeePercent / 100); 
      const totalAmount = subtotal + serviceFee;
      
      // Store ticket purchase details in localStorage for access after payment
      localStorage.setItem('ticketDetails', JSON.stringify({
        eventId: event.id,
        eventTitle: event.title,
        quantity: ticketCount,
        unitPrice: event.price,
        serviceFee: serviceFee,
        totalAmount: totalAmount,
        restaurantName: event.restaurant?.name || '',
        restaurantAddress: event.restaurant?.address || '',
        restaurantCity: event.restaurant?.city || '',
        date: event.date,
        time: event.time,
        timestamp: Date.now() // Add timestamp for tracking
      }));
      
      console.log("Creating payment with:", {
        eventId: event.id,
        quantity: ticketCount,
        userId: user.id,
        affiliateId: affiliateId
      });
      
      const paymentResult = await createTicketPayment(event.id, ticketCount, user.id, affiliateId);
      
      if (paymentResult.error) {
        throw new Error(paymentResult.error);
      }
      
      if (paymentResult.url) {
        // Redirect to the payment page - use window.location for full page navigation
        console.log("Redirecting to payment URL:", paymentResult.url);
        window.location.href = paymentResult.url;
      } else {
        throw new Error("No checkout URL returned from payment service");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process ticket purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  return {
    isPaymentProcessing,
    handleBuyTickets,
  };
};
