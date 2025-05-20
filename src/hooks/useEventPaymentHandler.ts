
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { EventDetails } from "@/hooks/types/eventTypes";
import { useReferralTracking } from "@/hooks/useReferralTracking";

export const useEventPaymentHandler = (event?: EventDetails | null) => {
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStoredReferralCode } = useReferralTracking(event?.id);

  const handleBuyTickets = async (ticketCount: number) => {
    if (!event) {
      toast({
        title: "Error",
        description: "Event details not available",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tickets",
      });
      navigate(`/login?redirect=${encodeURIComponent(`/event/${event.id}`)}`);
      return;
    }

    try {
      setIsPaymentProcessing(true);

      // Get price details
      const ticketPrice = event.price;
      const ticketTotal = ticketPrice * ticketCount;
      const serviceFee = ticketTotal * 0.05; // 5% service fee
      const totalAmount = ticketTotal + serviceFee;

      // Get stored referral code if available
      const referralCode = getStoredReferralCode(event.id);
      
      console.log(`Creating checkout for event ${event.id} with ${ticketCount} tickets${referralCode ? `, referral: ${referralCode}` : ''}`);
      
      // Initialize Stripe checkout for event tickets
      const response = await fetch("https://wocfwpedauuhlrfugxuu.supabase.co/functions/v1/create-event-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title, 
          ticketPrice: ticketPrice,
          quantity: ticketCount,
          customerEmail: user.email,
          serviceFee: serviceFee,
          totalAmount: totalAmount,
          referralCode: referralCode  // Include referral code in checkout
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Could not process payment",
        variant: "destructive",
      });
      setIsPaymentProcessing(false);
    }
  };

  return {
    handleBuyTickets,
    isPaymentProcessing,
  };
};
