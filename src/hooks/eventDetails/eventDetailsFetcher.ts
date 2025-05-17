
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "../types/eventTypes";
import { toast } from "@/hooks/use-toast";

/**
 * Fetch detailed event data including restaurant information
 */
export const fetchEventDetails = async (eventId: string): Promise<EventDetails> => {
  console.log("Fetching event details for ID:", eventId);
  
  try {
    // Validate UUID format to prevent invalid requests
    if (!isValidUUID(eventId)) {
      console.error("Invalid event ID format:", eventId);
      throw new Error("Invalid event ID format");
    }
    
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

    return eventDetails;
  } catch (error) {
    console.error("Failed to fetch event details:", error);
    throw error;
  }
};

/**
 * Check if the current user is the owner of the event
 */
export const checkEventOwnership = async (eventId: string): Promise<boolean> => {
  try {
    // Validate UUID format
    if (!isValidUUID(eventId)) {
      return false;
    }
    
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

/**
 * Utility to validate UUID format to prevent invalid requests
 */
function isValidUUID(uuid: string): boolean {
  // Simple regex for UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
