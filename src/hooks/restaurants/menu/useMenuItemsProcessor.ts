
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useCallback } from 'react';

type MenuItemData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  restaurant_id: string;
};

export const useMenuItemsProcessor = (
  fetchMediaForMenuItem: (restaurantId: string, menuItemId: string) => Promise<any[]>,
  fetchIngredientsForMenuItem: (menuItemId: string) => Promise<string[]>
) => {
  const processMenuItems = useCallback(async (
    menuData: MenuItemData[],
    restaurantId: string
  ): Promise<MenuItem[]> => {
    // Process menu items with media and ingredients
    return await Promise.all(menuData.map(async (item) => {
      console.log(`Processing menu item: ${item.name} (${item.id})`);
      
      // Fetch media for this item
      const media = await fetchMediaForMenuItem(restaurantId, item.id);
      console.log(`Retrieved ${media?.length || 0} media items for ${item.name}`);
      
      // Fetch ingredients for this item
      const ingredients = await fetchIngredientsForMenuItem(item.id);
      console.log(`Retrieved ${ingredients?.length || 0} ingredients for ${item.name}`);

      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        type: 'Other', // Default type
        ingredients,
        media
      };
    }));
  }, [fetchMediaForMenuItem, fetchIngredientsForMenuItem]);

  return { processMenuItems };
};
