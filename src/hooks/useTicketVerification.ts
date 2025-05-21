
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface TicketDetails {
  event_id: string;
  quantity: number;
  price: number;
  service_fee: number;
  total_amount: number;
  app_fee?: number;
  affiliate_fee?: number;
  ambassador_fee?: number;
  restaurant_revenue?: number;
}

export interface EventDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  restaurant: {
    name: string;
    address: string;
    city: string;
  };
}

export const useTicketVerification = (sessionId: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [distributionDetails, setDistributionDetails] = useState<{
    appFee?: number;
    affiliateFee?: number;
    ambassadorFee?: number;
    restaurantRevenue?: number;
  } | null>(null);

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No payment information found",
        variant: "destructive",
      });
      navigate("/events");
      return;
    }

    // Get stored ticket details from localStorage first
    const storedTicketDetails = localStorage.getItem("ticketDetails");
    if (storedTicketDetails) {
      const parsedDetails = JSON.parse(storedTicketDetails);
      setTicketDetails(parsedDetails);
    }

    // Clear the stored ticket details
    localStorage.removeItem("ticketDetails");

    const verifyPayment = async () => {
      try {
        // Get session for the API call
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view ticket details",
            variant: "default",
          });
          navigate("/login");
          return;
        }

        // Verify the payment with Stripe
        const response = await supabase.functions.invoke("verify-ticket-payment", {
          body: { sessionId },
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || "Failed to verify payment");
        }

        console.log("Verification response:", response.data);

        // Get ticket details from response
        const ticket = response.data.ticket;
        setTicketDetails(ticket);
        setEmailSent(!!response.data.emailSent);
        
        // Set distribution details if available
        if (response.data.distribution) {
          setDistributionDetails(response.data.distribution);
        }

        // Notify about invoice email
        if (response.data.emailSent) {
          toast({
            title: "Invoice Email Sent",
            description: "Your ticket details have been emailed to you",
          });
        }

        // Get event details
        if (ticket) {
          const { data: eventData, error: eventError } = await supabase
            .from("events")
            .select("*, restaurant:restaurants(*)")
            .eq("id", ticket.event_id)
            .single();

          if (eventError) {
            throw new Error(eventError.message);
          }

          // Format date to be more readable
          const formattedDate = new Date(eventData.date).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );

          setEventDetails({
            ...eventData,
            date: formattedDate,
          });
        }

        toast({
          title: "Success!",
          description: "Your tickets have been purchased successfully",
        });
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to verify payment",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate, toast]);

  return {
    isVerifying,
    ticketDetails,
    eventDetails,
    emailSent,
    distributionDetails
  };
};

export default useTicketVerification;
