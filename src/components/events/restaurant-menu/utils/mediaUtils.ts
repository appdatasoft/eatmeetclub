
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '../types';
import { createSessionCache } from '@/utils/fetch';

// Cache durations
const MEDIA_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const INGREDIENTS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch media for a specific menu item with improved caching
 */
export const fetchMenuItemMedia = async (restaurantId: string, menuItemId: string): Promise<MediaItem[]> => {
  const cacheKey = `menu_item_media_${restaurantId}_${menuItemId}`;
  const mediaCache = createSessionCache<MediaItem[]>(cacheKey, MEDIA_CACHE_DURATION);
  
  // Check cache first
  const cached = mediaCache.get();
  if (cached) {
    console.log(`Using cached media for menu item ${menuItemId}`);
    return cached;
  }
  
  try {
    const { data, error } = await supabase
      .from('restaurant_menu_media')
      .select('*')
      .eq('menu_item_id', menuItemId);
      
    if (error) throw error;
    
    const mediaItems: MediaItem[] = data?.map(item => ({
      id: item.id,
      url: item.url,
      type: item.media_type as 'image' | 'video'
    })) || [];
    
    // Store in cache
    mediaCache.set(mediaItems);
    return mediaItems;
  } catch (err) {
    console.error(`Error fetching media for menu item ${menuItemId}:`, err);
    return [];
  }
};

/**
 * Fetch ingredients for a specific menu item with improved caching
 */
export const fetchMenuItemIngredients = async (menuItemId: string): Promise<string[]> => {
  const cacheKey = `menu_item_ingredients_${menuItemId}`;
  const ingredientsCache = createSessionCache<string[]>(cacheKey, INGREDIENTS_CACHE_DURATION);
  
  // Check cache first
  const cached = ingredientsCache.get();
  if (cached) {
    console.log(`Using cached ingredients for menu item ${menuItemId}`);
    return cached;
  }
  
  try {
    const { data, error } = await supabase
      .from('restaurant_menu_ingredients')
      .select('name')
      .eq('menu_item_id', menuItemId);
      
    if (error) throw error;
    
    const ingredients: string[] = data?.map(item => item.name) || [];
    
    // Store in cache
    ingredientsCache.set(ingredients);
    return ingredients;
  } catch (err) {
    console.error(`Error fetching ingredients for menu item ${menuItemId}:`, err);
    return [];
  }
};
