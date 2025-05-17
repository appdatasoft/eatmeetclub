import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEventPaymentHandler } from "./event-payment/useEventPaymentHandler";
import { EventDetails, Restaurant } from "@/types/event";

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
        // Create a default restaurant object if one is not returned
        const restaurantData: Restaurant = data.restaurant && typeof data.restaurant === 'object' ? {
          id: data.restaurant?.id || 'unknown',
          name: data.restaurant?.name || 'Unknown Restaurant',
          address: data.restaurant?.address || '',
          city: data.restaurant?.city || '',
          state: data.restaurant?.state || '',
          zipcode: data.restaurant?.zipcode || '',
          description: data.restaurant?.description || ''
        } : {
          id: 'unknown',
          name: 'Unknown Restaurant',
          address: '',
          city: '',
          state: '',
          zipcode: '',
          description: ''
        };

        // Ensure data conforms to EventDetails type
        const eventData: EventDetails = {
          id: data.id,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          price: data.price,
          capacity: data.capacity,
          user_id: data.user_id,
          published: data.published,
          restaurant: restaurantData,
          cover_image: data.cover_image,
          tickets_sold: data.tickets_sold
        };
        setEvent(eventData);
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
