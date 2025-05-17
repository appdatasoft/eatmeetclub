
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EventDetails } from "@/types/event";
import { createTicketPayment } from "./paymentAPI";

export const useEventPaymentHandler = (event: EventDetails | null) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handleBuyTickets = async (quantity: number) => {
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
        ticketCount: quantity,
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
      
      // Calculate service fee (5% of total)
      const unitPrice = event.price;
      const subtotal = unitPrice * quantity;
      const serviceFee = subtotal * 0.05; // 5% service fee
      const totalAmount = subtotal + serviceFee;
      
      // Store ticket purchase details in localStorage for access after payment
      localStorage.setItem('ticketDetails', JSON.stringify({
        eventId: event.id,
        eventTitle: event.title,
        quantity: quantity,
        unitPrice: event.price,
        serviceFee: serviceFee,
        totalAmount: totalAmount
      }));
      
      const paymentResult = await createTicketPayment(event.id, quantity, user.id);
      
      if (paymentResult.url) {
        // Redirect to the payment page
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
