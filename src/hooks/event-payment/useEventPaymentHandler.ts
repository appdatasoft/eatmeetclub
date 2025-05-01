
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EventDetails } from "../types/eventTypes";
import { supabase } from "@/integrations/supabase/client";
import { createTicketPaymentSession } from "./paymentAPI";
import { storeTicketDetails, storePendingPurchase } from "./paymentUtils";

export interface EventPaymentHandlerResponse {
  isPaymentProcessing: boolean;
  handleBuyTickets: (ticketCount: number) => Promise<void>;
}

/**
 * Hook for handling event ticket payments
 */
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
        
        // Store pending purchase information
        storePendingPurchase(event.id, ticketCount, `/event/${event.id}`);
        
        navigate('/login');
        return;
      }

      // Check membership status
      const { data: membershipData } = await supabase
        .from('memberships')
        .select('status, renewal_at')
        .eq('user_id', sessionData.session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      const isMember = membershipData && 
        membershipData.status === 'active' && 
        (!membershipData.renewal_at || new Date(membershipData.renewal_at) > new Date());

      if (!isMember) {
        toast({
          title: "Membership Required",
          description: "You need an active membership to purchase tickets",
          variant: "default"
        });
        
        navigate('/become-member');
        return;
      }
      
      console.log("Starting ticket purchase process for event:", event.id);
      
      // Calculate service fee (5% of total)
      const unitPrice = event.price;
      const subtotal = unitPrice * ticketCount;
      const serviceFee = subtotal * 0.05; // 5% service fee
      const totalAmount = subtotal + serviceFee;
      
      // Create payment session and get checkout URL
      const checkoutUrl = await createTicketPaymentSession(
        token,
        event,
        ticketCount,
        serviceFee,
        totalAmount
      );
      
      // Store ticket details for access after payment
      storeTicketDetails(event, ticketCount, serviceFee, totalAmount);
      
      // Hard redirect with complete URL replacement - most reliable way to redirect
      console.log("Redirecting to Stripe checkout:", checkoutUrl);
      window.location.href = checkoutUrl;
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
