
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '../types';

/**
 * Fetches media items for a specific menu item
 */
export const fetchMenuItemMedia = async (
  restaurantId: string,
  menuItemId: string
): Promise<MediaItem[]> => {
  try {
    const { data, error } = await supabase
      .from('restaurant_menu_media')
      .select('*')
      .eq('menu_item_id', menuItemId)
      .eq('restaurant_id', restaurantId);
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      url: item.url,
      type: item.media_type as 'image' | 'video'
    })) || [];
  } catch (err) {
    console.error('Error fetching media for menu item:', err);
    return [];
  }
};

/**
 * Fetches ingredient list for a specific menu item
 */
export const fetchMenuItemIngredients = async (
  menuItemId: string
): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('restaurant_menu_ingredients')
      .select('name')
      .eq('menu_item_id', menuItemId);
    
    if (error) throw error;
    
    return data.map(item => item.name) || [];
  } catch (err) {
    console.error('Error fetching ingredients for menu item:', err);
    return [];
  }
};
