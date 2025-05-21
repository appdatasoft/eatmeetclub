
import { supabase } from "@/integrations/supabase/client";
import { EventFilters } from "../types/apiTypes";
import { extractRestaurantData } from "../utils/restaurantDataUtils";

/**
 * Fetches events with optional filtering
 */
export const fetchEvents = async (filters: EventFilters = {}) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, 
        title, 
        date, 
        price, 
        capacity,
        cover_image,
        restaurants (
          name,
          city,
          state
        )
      `)
      // Add filter conditions here based on the filters parameter
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
    
    // Transform the data to match our expected format
    return (data || []).map(event => {
      // Handle the restaurants property correctly
      const restaurantData = extractRestaurantData(event.restaurants);
      
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        price: event.price,
        capacity: event.capacity,
        cover_image: event.cover_image,
        restaurant: restaurantData
      };
    });
  } catch (error) {
    console.error('Error in fetchEvents:', error);
    throw error;
  }
};
