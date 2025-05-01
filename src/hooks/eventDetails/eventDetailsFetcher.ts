
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "../types/eventTypes";

export const fetchEventDetails = async (eventId: string): Promise<EventDetails> => {
  console.log("Fetching event details for ID:", eventId);
  
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      restaurant:restaurants (
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

  if (error) {
    console.error("Error fetching event details:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Event not found");
  }
  
  console.log("Event data received:", data);

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
      id: data.restaurant?.id,
      name: data.restaurant?.name || "Unknown Restaurant",
      address: data.restaurant?.address || "",
      city: data.restaurant?.city || "",
      state: data.restaurant?.state || "",
      zipcode: data.restaurant?.zipcode || "",
      description: data.restaurant?.description || "",
    },
    tickets_sold: data.tickets_sold || 0,
    user_id: data.user_id,
    cover_image: data.cover_image,
    published: data.published,
  };

  return eventDetails;
};

export const checkEventOwnership = async (eventId: string): Promise<boolean> => {
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return false;
  }
  
  const { data, error } = await supabase
    .from("events")
    .select("user_id")
    .eq("id", eventId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.user_id === currentUserId;
};

export const getTicketsSoldCount = async (eventId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('quantity')
    .eq('event_id', eventId)
    .eq('payment_status', 'completed');
    
  if (error) {
    console.error("Error fetching tickets:", error);
    return 0;
  }
  
  // Calculate total tickets sold
  if (!data || data.length === 0) {
    return 0;
  }
  
  return data.reduce((total, ticket) => total + ticket.quantity, 0);
};
