
import { supabase } from "@/integrations/supabase/client";
import { EventFilters } from "../types/apiTypes";
import { extractRestaurantData } from "../utils/restaurantDataUtils";

/**
 * Fetches events with optional filtering
 */
export const fetchEvents = async (filters: EventFilters = {}) => {
  try {
    console.log("Fetching events with filters:", filters);
    
    let query = supabase
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
      .eq('published', true);
      
    // Apply filters if provided
    if (filters.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte('date', filters.dateTo);
    }
    
    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin);
    }
    
    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax);
    }
    
    if (filters.location) {
      query = query.ilike('restaurants.city', `%${filters.location}%`);
    }
    
    // Order by date
    query = query.order('date', { ascending: true });
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No events found matching filters");
      return [];
    }
    
    // Transform the data to match our expected format
    return data.map(event => {
      // Handle the restaurants property correctly
      const restaurantData = extractRestaurantData(event.restaurants);
      
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        price: event.price,
        capacity: event.capacity,
        cover_image: event.cover_image || '',
        restaurant: restaurantData
      };
    });
  } catch (error) {
    console.error('Error in fetchEvents:', error);
    throw error;
  }
};
