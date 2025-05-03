
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EventDetails } from "../types/eventTypes";
import { createTicketPayment } from "./paymentAPI";

export const useEventPaymentHandler = (event: EventDetails | null) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handleBuyTickets = async (quantity: number) => {
    if (!event || !user) {
      toast({
        title: "Error",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPaymentProcessing(true);
      
      const paymentResult = await createTicketPayment(event.id, quantity, user.id);
      
      if (paymentResult.url) {
        // Redirect to the payment page
        window.location.href = paymentResult.url;
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred while processing your payment",
        variant: "destructive",
      });
      setIsPaymentProcessing(false);
    }
  };

  return {
    isPaymentProcessing,
    handleBuyTickets,
  };
};
