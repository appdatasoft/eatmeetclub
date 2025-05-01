
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EventDetails } from "./types/eventTypes";

export interface EventPaymentHandlerResponse {
  isPaymentProcessing: boolean;
  handleBuyTickets: (ticketCount: number) => Promise<void>;
}

export const useEventPaymentHandler = (
  event: EventDetails | null
): EventPaymentHandlerResponse => {
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle buying tickets
  const handleBuyTickets = async (ticketCount: number) => {
    if (!event) {
      toast({
        title: "Error",
        description: "Event details not available",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsPaymentProcessing(true);
      
      // Get session for the API call
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        // User is not authenticated, redirect to login
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase tickets",
          variant: "default"
        });
        
        // Save the current path to localStorage for redirect after login
        localStorage.setItem('redirectAfterLogin', `/event/${event.id}`);
        
        // Create a pending purchase object
        const pendingPurchase = {
          eventId: event.id,
          quantity: ticketCount,
          redirectPath: `/event/${event.id}`,
          timestamp: Date.now()
        };
        
        localStorage.setItem('pendingTicketPurchase', JSON.stringify(pendingPurchase));
        
        navigate('/login');
        return;
      }
      
      console.log("Starting ticket purchase process for event:", event.id);
      
      // Calculate service fee (5% of total)
      const unitPrice = event.price;
      const subtotal = unitPrice * ticketCount;
      const serviceFee = subtotal * 0.05; // 5% service fee
      const totalAmount = subtotal + serviceFee;
      
      // Prepare ticket purchase data
      const purchaseData = {
        eventId: event.id,
        quantity: ticketCount,
        unitPrice: unitPrice,
        serviceFee: serviceFee,
        totalAmount: totalAmount
      };
      
      console.log("Creating payment session with data:", purchaseData);
      
      // User is authenticated, create payment session with Stripe
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
      
      // Store ticket purchase details in localStorage for access after payment
      const restaurantData = event.restaurant || { name: "Unknown Venue" };
      localStorage.setItem('ticketDetails', JSON.stringify({
        eventId: event.id,
        eventTitle: event.title,
        quantity: ticketCount,
        price: event.price,
        service_fee: serviceFee,
        total_amount: totalAmount,
        restaurant: {
          name: restaurantData.name,
          address: restaurantData.address,
          city: restaurantData.city
        },
        date: event.date,
        time: event.time,
        timestamp: Date.now() // Add timestamp for tracking
      }));
      
      // Hard redirect with complete URL replacement - most reliable way to redirect
      console.log("Redirecting to Stripe checkout:", response.data.url);
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
