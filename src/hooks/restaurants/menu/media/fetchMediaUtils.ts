
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/components/restaurants/menu/types/mediaTypes';

/**
 * Fetches media items for a specific menu item with better error handling and caching
 */
export const fetchMediaForMenuItem = async (
  restaurantId: string,
  menuItemId: string
): Promise<MediaItem[]> => {
  try {
    // Add cache key for menu item media to avoid refetching too often
    const cacheKey = `menu_media_${menuItemId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        // Increase cache time to 10 minutes to reduce API calls
        if (Date.now() - timestamp < 600000) {
          console.log('Using cached menu media data');
          return data;
        }
      } catch (e) {
        console.warn("Error parsing cached menu media", e);
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    const { data, error } = await supabase
      .from('restaurant_menu_media')
      .select('*')
      .eq('menu_item_id', menuItemId)
      .eq('restaurant_id', restaurantId);
    
    if (error) throw error;
    
    const mediaItems = data.map(item => ({
      id: item.id,
      url: item.url,
      type: item.media_type as 'image' | 'video'
    })) || [];
    
    // Cache the data with longer timeout
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data: mediaItems,
      timestamp: Date.now()
    }));
    
    return mediaItems;
  } catch (err) {
    console.error('Error fetching media for menu item:', err);
    // Return empty array instead of failing
    return [];
  }
};

/**
 * Fetches ingredient list for a specific menu item with better error handling and caching
 */
export const fetchIngredientsForMenuItem = async (
  menuItemId: string
): Promise<string[]> => {
  try {
    // Add cache key for ingredients to avoid refetching too often
    const cacheKey = `ingredients_${menuItemId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        // Increase cache time to 10 minutes to reduce API calls
        if (Date.now() - timestamp < 600000) {
          console.log('Using cached ingredients data');
          return data;
        }
      } catch (e) {
        console.warn("Error parsing cached ingredients", e);
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    const { data, error } = await supabase
      .from('restaurant_menu_ingredients')
      .select('name')
      .eq('menu_item_id', menuItemId);
    
    if (error) throw error;
    
    const ingredients = data.map(item => item.name) || [];
    
    // Cache the data with longer timeout
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data: ingredients,
      timestamp: Date.now()
    }));
    
    return ingredients;
  } catch (err) {
    console.error('Error fetching ingredients for menu item:', err);
    // Return empty array instead of failing
    return [];
  }
};
