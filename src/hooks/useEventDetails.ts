import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEventPaymentHandler } from "./event-payment/useEventPaymentHandler";

interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  user_id: string;
  published: boolean;
  restaurant: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    description: string;
  };
  cover_image?: string;
  tickets_sold?: number;
}

export const useEventDetails = (eventId: string | undefined) => {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);

  const {
    isPaymentProcessing,
    handleBuyTickets,
  } = useEventPaymentHandler(event);

  const refreshEventDetails = async () => {
    if (!eventId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          restaurant (
            id,
            name,
            address,
            city,
            state,
            zipcode,
            description
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setEvent(data);
        setError(null);
      } else {
        setError('Event not found');
        setEvent(null);
      }
    } catch (err: any) {
      setError(err.message);
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;

    refreshEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (user && event) {
      setIsCurrentUserOwner(user.id === event.user_id);
    } else {
      setIsCurrentUserOwner(false);
    }
  }, [user, event]);

  return {
    event,
    isLoading,
    error,
    isPaymentProcessing,
    handleBuyTickets,
    isCurrentUserOwner,
    refreshEventDetails
  };
};
