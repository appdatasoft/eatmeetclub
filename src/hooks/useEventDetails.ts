
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Restaurant {
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  description: string;
}

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  restaurant: Restaurant;
  tickets_sold?: number;
  user_id: string;
  cover_image?: string;
}

export const useEventDetails = (eventId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      
      // First get the current user
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      // Fetch event data with restaurant details
      const { data, error } = await supabase
        .from('events')
        .select('*, restaurant:restaurants(*)')
        .eq('id', eventId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Count tickets sold for this event
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('quantity')
        .eq('event_id', eventId)
        .eq('payment_status', 'completed');
        
      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
      }
      
      // Calculate total tickets sold
      let ticketsSold = 0;
      if (ticketsData && ticketsData.length > 0) {
        ticketsSold = ticketsData.reduce((total, ticket) => total + ticket.quantity, 0);
      }
        
      // Format the event data
      if (data) {
        // Format the date to a more readable format
        const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        setEvent({
          ...data,
          date: formattedDate,
          tickets_sold: ticketsSold
        });
        
        // Check if the current user is the owner of this event
        if (currentUserId && data.user_id === currentUserId) {
          setIsCurrentUserOwner(true);
        } else {
          setIsCurrentUserOwner(false);
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);
  
  const refreshEventDetails = useCallback(async () => {
    await fetchEventDetails();
  }, [fetchEventDetails]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

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
        
        // Save the current page to redirect back after login
        localStorage.setItem('redirectAfterLogin', `/event/${eventId}`);
        navigate('/login');
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

  return {
    event,
    loading,
    isPaymentProcessing,
    isCurrentUserOwner,
    handleBuyTickets,
    refreshEventDetails
  };
};
