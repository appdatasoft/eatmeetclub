
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
    
    // First get event data
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
      throw new Error(eventError.message || "Failed to load event details");
    }

    if (!eventData) {
      throw new Error("Event not found");
    }
    
    console.log("Event data received:", eventData);
    
    // Now fetch restaurant data using restaurant_id from events table
    let restaurantData = null;
    if (eventData.restaurant_id) {
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", eventData.restaurant_id)
        .single();
        
      if (restaurantError) {
        console.error("Error fetching restaurant:", restaurantError);
        // Don't throw here, just log the error and continue with null restaurant
      } else {
        restaurantData = restaurant;
        console.log("Restaurant data successfully fetched:", restaurantData);
      }
    } else {
      console.warn("No restaurant_id found for event:", eventId);
    }

    // Transform the data to match the EventDetails interface
    const eventDetails: EventDetails = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description || "",
      date: eventData.date,
      time: eventData.time,
      price: eventData.price,
      capacity: eventData.capacity,
      restaurant: restaurantData ? {
        id: restaurantData.id,
        name: restaurantData.name || "Unknown Restaurant",
        address: restaurantData.address || "",
        city: restaurantData.city || "",
        state: restaurantData.state || "",
        zipcode: restaurantData.zipcode || "",
        description: restaurantData.description || "",
      } : {
        id: "unknown",
        name: "Unknown Restaurant",
        address: "",
        city: "",
        state: "",
        zipcode: "",
        description: "",
      },
      tickets_sold: eventData.tickets_sold || 0,
      user_id: eventData.user_id,
      cover_image: eventData.cover_image,
      published: eventData.published,
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
