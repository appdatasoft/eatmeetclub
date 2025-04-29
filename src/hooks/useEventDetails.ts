
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
      
      // Format the event data
      if (data) {
        // Format the date to a more readable format
        const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Calculate tickets sold (this is a placeholder - you'd need to implement actual ticket tracking)
        const ticketsSold = 0; // Replace with actual query once you have tickets table
        
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
    
    setIsPaymentProcessing(true);
    
    try {
      // Get session for the API call
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      // Prepare ticket purchase data
      const purchaseData = {
        eventId: event.id,
        quantity: ticketCount,
        unitPrice: event.price
      };
      
      if (token) {
        // User is authenticated, create payment session with Stripe
        const response = await supabase.functions.invoke('create-ticket-payment', {
          body: { purchaseData },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.error || !response.data?.url) {
          throw new Error(response.error?.message || "Failed to create payment session");
        }
        
        // Store ticket purchase details in localStorage for access after payment
        localStorage.setItem('ticketDetails', JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          quantity: ticketCount,
          totalAmount: (event.price * ticketCount * 1.05)
        }));
        
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        // User is not authenticated, redirect to login
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase tickets",
          variant: "default"
        });
        
        // Save the current page to redirect back after login
        localStorage.setItem('redirectAfterLogin', `/event/${eventId}`);
        navigate('/login');
      }
    } catch (error) {
      console.error("Error creating payment session:", error);
      toast({
        title: "Error",
        description: "Failed to process ticket purchase. Please try again.",
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
