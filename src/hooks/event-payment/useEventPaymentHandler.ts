
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/types/event";

export const useEventPaymentHandler = (event: EventDetails | null) => {
  const { toast } = useToast();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handleBuyTickets = async (event: EventDetails | null, ticketCount: number) => {
    if (!event) return;
    
    try {
      setIsPaymentProcessing(true);
      
      // Get session for the API call
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase tickets",
          variant: "default"
        });
        return;
      }
      
      // Calculate service fee (5% of total)
      const unitPrice = event.price;
      const subtotal = unitPrice * ticketCount;
      const serviceFee = subtotal * 0.05; // 5% service fee
      const totalAmount = subtotal + serviceFee;
      
      // Prepare ticket purchase data
      const purchaseData = {
        eventId: event.id,
        quantity: ticketCount,
        unitPrice,
        serviceFee,
        totalAmount
      };
      
      // Create payment session with Stripe
      const response = await supabase.functions.invoke('create-ticket-payment', {
        body: { purchaseData },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to create payment session");
      }
      
      if (!response.data?.url) {
        throw new Error("No checkout URL returned from payment service");
      }
      
      // Store ticket purchase details in localStorage for access after payment
      localStorage.setItem('ticketDetails', JSON.stringify({
        eventId: event.id,
        eventTitle: event.title,
        quantity: ticketCount,
        unitPrice: event.price,
        serviceFee,
        totalAmount
      }));
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error("Error creating payment session:", error);
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
    handleBuyTickets
  };
};
