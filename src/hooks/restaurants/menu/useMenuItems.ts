
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItemMedia } from '@/hooks/restaurants/menu/useMenuItemMedia';
import { useMenuItemsProcessor } from './useMenuItemsProcessor';

export const useMenuItems = (restaurantId: string | undefined) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchMediaForMenuItem, fetchIngredientsForMenuItem } = useMenuItemMedia();
  const { processMenuItems } = useMenuItemsProcessor(fetchMediaForMenuItem, fetchIngredientsForMenuItem);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        setIsLoading(false);
        setMenuItems([]);
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
          
          // Process the menu items with the dedicated processor
          const processed = await processMenuItems(menuData, restaurantId);
          setMenuItems(processed);
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
  }, [restaurantId, processMenuItems]);

  return { menuItems, setMenuItems, isLoading, error };
};
