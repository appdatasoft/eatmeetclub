
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  restaurant: {
    id?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    description: string;
  };
  tickets_sold?: number;
  user_id: string;
  cover_image?: string;
  published: boolean;
}

export const useEventDetails = (eventId: string | undefined) => {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const { toast } = useToast();

  // Function to refresh event details
  const refreshEventDetails = async () => {
    if (!eventId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First get the current user (if logged in)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      const { data, error: fetchError } = await supabase
        .from("events")
        .select(`
          *,
          restaurants (
            id,
            name,
            address,
            city,
            state,
            zipcode,
            description
          )
        `)
        .eq("id", eventId)
        .single();

      if (fetchError) {
        console.error("Error fetching event details:", fetchError);
        setError("Failed to load event details");
        return;
      }

      if (!data) {
        setError("Event not found");
        return;
      }

      // Transform the data to match the EventDetails interface
      const eventDetails: EventDetails = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        date: data.date,
        time: data.time,
        price: data.price,
        capacity: data.capacity,
        restaurant: {
          id: data.restaurants?.id,
          name: data.restaurants?.name || "Unknown Restaurant",
          address: data.restaurants?.address || "",
          city: data.restaurants?.city || "",
          state: data.restaurants?.state || "",
          zipcode: data.restaurants?.zipcode || "",
          description: data.restaurants?.description || "",
        },
        tickets_sold: data.tickets_sold || 0,
        user_id: data.user_id,
        cover_image: data.cover_image,
        published: data.published,
      };

      setEvent(eventDetails);
      
      // Check if the current user is the owner of this event
      if (currentUserId && data.user_id === currentUserId) {
        setIsCurrentUserOwner(true);
      } else {
        setIsCurrentUserOwner(false);
      }
    } catch (err: any) {
      console.error("Error in useEventDetails:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle buying tickets
  const handleBuyTickets = async (ticketCount: number) => {
    if (!event) return;
    
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
      localStorage.setItem('ticketDetails', JSON.stringify({
        eventId: event.id,
        eventTitle: event.title,
        quantity: ticketCount,
        unitPrice: event.price,
        serviceFee: serviceFee,
        totalAmount: totalAmount
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

  useEffect(() => {
    refreshEventDetails();
  }, [eventId]);

  return {
    event,
    isLoading,
    error,
    isCurrentUserOwner,
    isPaymentProcessing,
    handleBuyTickets,
    refreshEventDetails
  };
};
