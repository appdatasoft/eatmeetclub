
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/components/restaurants/menu/types/mediaTypes';
import { createSessionCache } from '@/utils/fetch/sessionStorageCache';

/**
 * Improved media fetch functions with proper caching and response handling
 */

export const fetchMediaForMenuItem = async (restaurantId: string, menuItemId: string): Promise<MediaItem[]> => {
  try {
    // Use cache to prevent "body stream already read" errors
    const cacheKey = `menu_media_${restaurantId}_${menuItemId}`;
    const cache = createSessionCache<MediaItem[]>(cacheKey, 5 * 60 * 1000, {
      staleWhileRevalidate: true
    });
    
    const cachedMedia = cache.get();
    if (cachedMedia) {
      return cachedMedia;
    }
    
    const { data, error } = await supabase
      .from('restaurant_menu_media')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('menu_item_id', menuItemId);
      
    if (error) {
      console.error('Error fetching media for menu item:', error);
      return [];
    }
    
    const mediaItems = data?.map(item => ({
      id: item.id,
      type: item.media_type || 'image',
      url: item.url,
      menuItemId: item.menu_item_id
    })) as MediaItem[] || [];
    
    cache.set(mediaItems);
    return mediaItems;
  } catch (error) {
    console.error('Error in fetchMediaForMenuItem:', error);
    return [];
  }
};

export const fetchIngredientsForMenuItem = async (menuItemId: string): Promise<string[]> => {
  try {
    // Use cache to prevent "body stream already read" errors
    const cacheKey = `menu_ingredients_${menuItemId}`;
    const cache = createSessionCache<string[]>(cacheKey, 5 * 60 * 1000, {
      staleWhileRevalidate: true
    });
    
    const cachedIngredients = cache.get();
    if (cachedIngredients) {
      return cachedIngredients;
    }
    
    const { data, error } = await supabase
      .from('restaurant_menu_ingredients')
      .select('name')
      .eq('menu_item_id', menuItemId);
      
    if (error) {
      console.error('Error fetching ingredients for menu item:', error);
      return [];
    }
    
    const ingredients = data?.map(item => item.name) || [];
    
    cache.set(ingredients);
    return ingredients;
  } catch (error) {
    console.error('Error in fetchIngredientsForMenuItem:', error);
    return [];
  }
};

// Prefetch multiple menu items' media and ingredients in the background
export const prefetchMenuItemsData = async (
  restaurantId: string, 
  menuItemIds: string[]
): Promise<void> => {
  if (!menuItemIds.length) return;
  
  try {
    console.log(`Prefetching data for ${menuItemIds.length} menu items in background`);
    
    // Process in smaller batches to prevent overwhelming the browser
    const chunkSize = 3; 
    for (let i = 0; i < menuItemIds.length; i += chunkSize) {
      const chunk = menuItemIds.slice(i, i + chunkSize);
      
      // Fetch media and ingredients in parallel for each item in the chunk
      await Promise.all(chunk.flatMap(itemId => [
        fetchMediaForMenuItem(restaurantId, itemId).catch(() => []),
        fetchIngredientsForMenuItem(itemId).catch(() => [])
      ]));
      
      // Small delay between chunks
      if (i + chunkSize < menuItemIds.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    console.log('Background prefetch completed');
  } catch (error) {
    console.error('Error during prefetch:', error);
    // Don't throw errors from prefetch operations
  }
};
