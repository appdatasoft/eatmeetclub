
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export interface TicketDetails {
  id: string;
  payment_id: string;
  quantity: number;
  total_amount: number;
  purchase_date: string;
}

export interface EventDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  restaurant: {
    name: string;
    id: string;
  };
}

export const useTicketVerification = (sessionId: string | null) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }
      
      try {
        // Get current user's email
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Get the stored referral code if any
        const searchParams = new URLSearchParams(window.location.search);
        const eventId = searchParams.get('event_id');
        let referralCode = null;
        
        if (eventId) {
          referralCode = sessionStorage.getItem(`ref_${eventId}`);
        }
        
        // Get Supabase URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
        
        // Verify the payment with the backend
        const response = await fetch(`${supabaseUrl}/functions/v1/verify-ticket-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId, 
            email: user.email,
            eventId,
            referralCode
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Verification failed');
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Clear the referral code from session storage after successful purchase
          if (eventId) {
            sessionStorage.removeItem(`ref_${eventId}`);
          }
          
          // Mark email as sent
          setEmailSent(true);
          
          // Fetch ticket details
          const { data: ticketData, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('payment_id', sessionId)
            .single();
            
          if (ticketError) throw ticketError;
          
          setTicketDetails(ticketData as TicketDetails);
          
          // Fetch event details
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select(`
              id,
              title,
              date,
              time,
              description,
              restaurant:restaurants (
                id,
                name
              )
            `)
            .eq('id', ticketData.event_id)
            .single();
            
          if (eventError) throw eventError;
          
          setEventDetails(eventData as EventDetails);
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Error verifying ticket payment:', error);
        toast({
          title: 'Verification Failed',
          description: error.message || 'Failed to verify your ticket purchase',
          variant: 'destructive'
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPayment();
  }, [sessionId, toast]);
  
  return {
    isVerifying,
    ticketDetails,
    eventDetails,
    emailSent
  };
};
