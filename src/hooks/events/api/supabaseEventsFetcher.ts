
import { supabase } from "@/integrations/supabase/client";
import { RawEventData } from "../types/apiTypes";
import { extractRestaurantData } from "../utils/restaurantDataUtils";

/**
 * Fetches published events using the Supabase client
 */
export const fetchPublishedEventsWithSupabase = async (): Promise<RawEventData[] | null> => {
  console.log("Attempting to fetch events with Supabase client...");
  
  try {
    const response = await supabase
      .from('events')
      .select(`
        id, 
        title, 
        date, 
        time, 
        price, 
        capacity,
        cover_image,
        published,
        user_id,
        restaurant_id,
        restaurants(name, city, state)
      `)
      .eq('published', true)
      .order('date', { ascending: true });
      
    if (response.error) {
      console.error("Supabase client query error:", response.error);
      throw response.error;
    }
    
    // Transform the nested restaurants format to our expected RawEventData format
    const transformedData: RawEventData[] = response.data?.map(event => {
      // Safely extract restaurant data based on its structure
      const restaurantData = extractRestaurantData(event.restaurants);
      
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        price: event.price,
        capacity: event.capacity,
        cover_image: event.cover_image,
        published: event.published,
        user_id: event.user_id,
        restaurant_id: event.restaurant_id,
        restaurants: restaurantData
      };
    }) || [];
    
    console.log("Events fetched successfully with Supabase client:", transformedData.length, "events");
    return transformedData;
  } catch (error) {
    console.error("Error in fetchPublishedEventsWithSupabase:", error);
    throw error;
  }
};
