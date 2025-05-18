
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/components/restaurants/menu/types/mediaTypes';
import { createSessionCache } from '@/utils/fetchUtils';

/**
 * Fetches media items for a specific menu item with better error handling and caching
 */
export const fetchMediaForMenuItem = async (
  restaurantId: string,
  menuItemId: string
): Promise<MediaItem[]> => {
  try {
    // Use advanced session cache with longer TTL
    const cacheKey = `menu_media_${menuItemId}`;
    const cache = createSessionCache<MediaItem[]>(cacheKey, 15 * 60 * 1000); // 15 minutes
    
    const cachedData = cache.get();
    if (cachedData) {
      console.log(`Using cached menu media data for item ${menuItemId}`);
      return cachedData;
    }
    
    // Use single try block to reduce complexity
    console.log(`Fetching media for menu item: ${menuItemId}`);
    
    // Implement backoff for network errors
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        const { data, error } = await supabase
          .from('restaurant_menu_media')
          .select('*')
          .eq('menu_item_id', menuItemId)
          .eq('restaurant_id', restaurantId);
        
        if (error) throw error;
        
        // Important: Convert response data once, and store the resulting object
        const mediaItems = (data || []).map(item => ({
          id: item.id,
          url: item.url,
          type: item.media_type as 'image' | 'video'
        }));
        
        // Cache the successful response
        cache.set(mediaItems);
        
        return mediaItems;
      } catch (err) {
        retryCount++;
        if (retryCount > maxRetries) throw err;
        
        // Exponential backoff
        const delay = Math.min(10000, Math.pow(2, retryCount) * 1000);
        console.warn(`Media fetch failed, retry ${retryCount} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error("Failed to fetch media after retries");
  } catch (err) {
    console.error('Error fetching media for menu item:', err);
    // Return empty array instead of failing to prevent cascading failures
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
    // Use advanced session cache with longer TTL  
    const cacheKey = `ingredients_${menuItemId}`;
    const cache = createSessionCache<string[]>(cacheKey, 20 * 60 * 1000); // 20 minutes
    
    const cachedData = cache.get();
    if (cachedData) {
      console.log(`Using cached ingredients data for item ${menuItemId}`);
      return cachedData;
    }
    
    // Implement backoff for network errors
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        const { data, error } = await supabase
          .from('restaurant_menu_ingredients')
          .select('name')
          .eq('menu_item_id', menuItemId);
        
        if (error) throw error;
        
        // Important: Process the data immediately to avoid multiple reads
        const ingredients = (data || []).map(item => item.name);
        
        // Cache the successful response
        cache.set(ingredients);
        
        return ingredients;
      } catch (err) {
        retryCount++;
        if (retryCount > maxRetries) throw err;
        
        // Exponential backoff
        const delay = Math.min(10000, Math.pow(2, retryCount) * 1000);
        console.warn(`Ingredients fetch failed, retry ${retryCount} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error("Failed to fetch ingredients after retries");
  } catch (err) {
    console.error('Error fetching ingredients for menu item:', err);
    // Return empty array instead of failing
    return [];
  }
};

/**
 * Prefetches media and ingredients for multiple menu items
 * This is useful when loading a restaurant menu to reduce individual requests
 */
export const prefetchMenuItemsData = async (
  restaurantId: string,
  menuItemIds: string[]
): Promise<void> => {
  try {
    if (!menuItemIds.length) return;
    
    console.log(`Prefetching data for ${menuItemIds.length} menu items`);
    
    // Create batch jobs with fewer concurrent requests
    const batchSize = 2; // Reduced from 3 to 2 to lower request rate
    for (let i = 0; i < menuItemIds.length; i += batchSize) {
      const batch = menuItemIds.slice(i, i + batchSize);
      
      // Fetch media and ingredients concurrently for the batch
      await Promise.all(
        batch.map(itemId => 
          Promise.allSettled([
            fetchMediaForMenuItem(restaurantId, itemId),
            fetchIngredientsForMenuItem(itemId)
          ])
        )
      );
      
      // Add larger delay between batches to avoid rate limiting
      if (i + batchSize < menuItemIds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased from 1000 to 2000ms
      }
    }
    
    console.log(`Prefetch completed for ${menuItemIds.length} menu items`);
  } catch (err) {
    console.error('Error during prefetch:', err);
    // Non-blocking, so we just log errors
  }
};
