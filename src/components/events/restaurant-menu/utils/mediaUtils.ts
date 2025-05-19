
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '../types';
import { extractResponseData } from '@/integrations/supabase/utils/responseUtils';
import { createSessionCache } from '@/utils/fetch/sessionStorageCache';

// Fetch media for a menu item with improved caching and response handling
export const fetchMenuItemMedia = async (restaurantId: string, itemId: string): Promise<MediaItem[]> => {
  try {
    // Use session cache to prevent multiple fetches
    const cacheKey = `menu_item_media_${restaurantId}_${itemId}`;
    const cache = createSessionCache<MediaItem[]>(cacheKey, 5 * 60 * 1000);
    
    // Check cache first
    const cachedMedia = cache.get();
    if (cachedMedia) {
      return cachedMedia;
    }

    const { data, error } = await supabase
      .from('restaurant_menu_media')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('menu_item_id', itemId);

    if (error) {
      console.error('Error fetching menu item media:', error);
      return [];
    }

    const media = data?.map(item => ({
      id: item.id,
      type: item.media_type || 'image',
      url: item.url,
      menuItemId: item.menu_item_id
    })) as MediaItem[] || [];

    // Cache the result
    cache.set(media);
    return media;
  } catch (error) {
    console.error('Error in fetchMenuItemMedia:', error);
    return [];
  }
};

// Fetch ingredients for a menu item with improved caching and response handling
export const fetchMenuItemIngredients = async (itemId: string): Promise<string[]> => {
  try {
    // Use session cache to prevent multiple fetches
    const cacheKey = `menu_item_ingredients_${itemId}`;
    const cache = createSessionCache<string[]>(cacheKey, 5 * 60 * 1000);
    
    // Check cache first
    const cachedIngredients = cache.get();
    if (cachedIngredients) {
      return cachedIngredients;
    }

    const { data, error } = await supabase
      .from('restaurant_menu_ingredients')
      .select('name')
      .eq('menu_item_id', itemId);

    if (error) {
      console.error('Error fetching menu item ingredients:', error);
      return [];
    }

    const ingredients = data?.map(item => item.name) || [];

    // Cache the result
    cache.set(ingredients);
    return ingredients;
  } catch (error) {
    console.error('Error in fetchMenuItemIngredients:', error);
    return [];
  }
};

// Prefetch additional data for menu items in the background
export const prefetchMenuItemsData = async (restaurantId: string, itemIds: string[]): Promise<void> => {
  try {
    // Process in chunks to avoid overloading the browser
    const chunkSize = 3;
    
    for (let i = 0; i < itemIds.length; i += chunkSize) {
      const chunk = itemIds.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (itemId) => {
        // Prefetch media
        await fetchMenuItemMedia(restaurantId, itemId);
        
        // Prefetch ingredients
        await fetchMenuItemIngredients(itemId);
      }));
      
      // Small delay between chunks to prevent overwhelming the network
      if (i + chunkSize < itemIds.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  } catch (error) {
    console.error('Error prefetching menu items data:', error);
  }
};
