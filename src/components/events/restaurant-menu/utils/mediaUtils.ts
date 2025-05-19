
import { supabase } from '@/integrations/supabase/client';
import { createSessionCache } from '@/utils/fetch';

// Cache durations
const MEDIA_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const INGREDIENTS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch media for a menu item with improved caching
 */
export const fetchMenuItemMedia = async (restaurantId: string, menuItemId: string) => {
  const cacheKey = `menu_media_${restaurantId}_${menuItemId}`;
  const cache = createSessionCache(cacheKey, MEDIA_CACHE_DURATION);
  
  // Check cache first
  const cachedMedia = cache.get();
  if (cachedMedia) {
    return cachedMedia;
  }
  
  try {
    const { data: mediaItems } = await supabase
      .from('restaurant_menu_media')
      .select('id, url, media_type')
      .match({ restaurant_id: restaurantId, menu_item_id: menuItemId })
      .limit(5); // Limit to 5 media items per menu item
      
    const result = mediaItems || [];
    cache.set(result);
    return result;
  } catch (error) {
    console.error(`Error fetching media for menu item ${menuItemId}:`, error);
    return [];
  }
};

/**
 * Fetch ingredients for a menu item with improved caching
 */
export const fetchMenuItemIngredients = async (menuItemId: string) => {
  const cacheKey = `menu_ingredients_${menuItemId}`;
  const cache = createSessionCache(cacheKey, INGREDIENTS_CACHE_DURATION);
  
  // Check cache first
  const cachedIngredients = cache.get();
  if (cachedIngredients) {
    return cachedIngredients;
  }
  
  try {
    const { data: ingredients } = await supabase
      .from('restaurant_menu_ingredients')
      .select('id, name')
      .eq('menu_item_id', menuItemId)
      .limit(20); // Limit to 20 ingredients per menu item
      
    const result = ingredients || [];
    cache.set(result);
    return result;
  } catch (error) {
    console.error(`Error fetching ingredients for menu item ${menuItemId}:`, error);
    return [];
  }
};

/**
 * Prefetch media and ingredients for menu items to improve perceived performance
 */
export const prefetchMenuItemDetails = async (menuItems: Array<{ id: string, restaurant_id: string }>) => {
  if (!menuItems.length) return;
  
  // Only prefetch the first 5 items to avoid overwhelming the API
  const itemsToPreload = menuItems.slice(0, 5);
  
  // Use low priority, non-blocking requests
  setTimeout(() => {
    itemsToPreload.forEach(item => {
      // Use a short timeout for each item to stagger requests
      const delay = Math.random() * 200;
      setTimeout(() => {
        fetchMenuItemMedia(item.restaurant_id, item.id).catch(() => {});
        fetchMenuItemIngredients(item.id).catch(() => {});
      }, delay);
    });
  }, 100);
};
