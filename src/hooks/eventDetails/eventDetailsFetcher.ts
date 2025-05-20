
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "../types/eventTypes";
import { toast } from "@/hooks/use-toast";

/**
 * Fetch detailed event data including restaurant information
 */
export const fetchEventDetails = async (eventId: string): Promise<EventDetails> => {
  console.log("Fetching event details for ID:", eventId);
  
  try {
    // Extract event ID if it's in the format "name-name-uuid"
    const extractedId = extractUuidFromSlug(eventId);
    const idToUse = extractedId || eventId;
    
    // Validate UUID format to prevent invalid requests
    if (!isValidUUID(idToUse)) {
      console.error("Invalid event ID format:", idToUse);
      throw new Error("Invalid event ID format");
    }
    
    // First get event data with restaurant details
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select(`
        *,
        restaurant:restaurants(
          id,
          name,
          address,
          city,
          state,
          zipcode,
          description,
          phone,
          website,
          logo_url
        )
      `)
      .eq("id", idToUse)
      .single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
      throw new Error(eventError.message || "Failed to load event details");
    }

    if (!eventData) {
      throw new Error("Event not found");
    }
    
    console.log("Raw event data with restaurant details:", eventData);
    
    // Transform the data to match the EventDetails interface
    const eventDetails: EventDetails = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description || "",
      date: eventData.date,
      time: eventData.time,
      price: eventData.price,
      capacity: eventData.capacity,
      restaurant: eventData.restaurant ? {
        id: eventData.restaurant.id,
        name: eventData.restaurant.name || "Unknown Restaurant",
        address: eventData.restaurant.address || "",
        city: eventData.restaurant.city || "",
        state: eventData.restaurant.state || "",
        zipcode: eventData.restaurant.zipcode || "",
        description: eventData.restaurant.description || "",
        phone: eventData.restaurant.phone || "",
        website: eventData.restaurant.website || "",
        logo_url: eventData.restaurant.logo_url || ""
      } : {
        id: "unknown",
        name: "Unknown Restaurant",
        address: "",
        city: "",
        state: "",
        zipcode: "",
        description: "",
        phone: "",
        website: "",
        logo_url: ""
      },
      tickets_sold: eventData.tickets_sold || 0,
      user_id: eventData.user_id,
      cover_image: eventData.cover_image,
      published: eventData.published,
    };

    // Log the transformed data to verify restaurant description is included
    console.log("Transformed event details with restaurant data:", {
      ...eventDetails,
      restaurant: {
        ...eventDetails.restaurant
      }
    });

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
    // Extract UUID if needed
    const extractedId = extractUuidFromSlug(eventId);
    const idToUse = extractedId || eventId;
    
    // Validate UUID format
    if (!isValidUUID(idToUse)) {
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
      .eq("id", idToUse)
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

/**
 * Extract UUID from slug if in format "name-name-uuid"
 */
function extractUuidFromSlug(slug: string): string | null {
  // Check if the input contains a UUID pattern
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i;
  const match = slug.match(uuidPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}
