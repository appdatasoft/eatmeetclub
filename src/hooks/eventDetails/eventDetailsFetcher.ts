
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "../types/eventTypes";
import { toast } from "@/hooks/use-toast";

/**
 * Fetch detailed event data including restaurant information
 */
export const fetchEventDetails = async (eventId: string): Promise<EventDetails> => {
  console.log("Fetching event details for ID:", eventId);
  
  const { data, error: fetchError } = await supabase
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

  if (fetchError) {
    console.error("Error fetching event details:", fetchError);
    throw new Error(fetchError.message || "Failed to load event details");
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

/**
 * Check if the current user is the owner of the event
 */
export const checkEventOwnership = async (eventId: string): Promise<boolean> => {
  try {
    // First get the current user (if logged in)
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    console.log("Current user ID:", currentUserId);
    
    if (!currentUserId) return false;
    
    // Get event owner info
    const { data } = await supabase
      .from("events")
      .select("user_id")
      .eq("id", eventId)
      .single();
      
    return data?.user_id === currentUserId;
  } catch (err) {
    console.error("Error checking event ownership:", err);
    return false;
  }
};
