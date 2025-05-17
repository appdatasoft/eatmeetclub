
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '../types';
import { fetchMenuItemMedia, fetchMenuItemIngredients } from '../utils/mediaUtils';

export const useMenuItemsFetcher = (restaurantId: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuTypes, setMenuTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching menu items for restaurant: ${restaurantId}`);

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);

        if (menuError) throw menuError;

        if (menuData && menuData.length > 0) {
          console.log(`Found ${menuData.length} menu items`);

          // Process menu items with media and ingredients
          const processedItems = await Promise.all(menuData.map(async (item) => {
            // Fetch media for this item
            const media = await fetchMenuItemMedia(restaurantId, item);
            
            // Fetch ingredients for this item
            const ingredients = await fetchMenuItemIngredients(item.id);

            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              // Use a default type if not present in the database item
              type: 'Other',
              ingredients,
              media,
              restaurant_id: restaurantId
            };
          }));

          setMenuItems(processedItems);
        } else {
          console.log('No menu items found');
          setMenuItems([]);
        }
      } catch (err: any) {
        console.error('Error fetching menu items:', err);
        setError(err.message || 'Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurantId]);

  return { menuItems, menuTypes, isLoading, error };
};
