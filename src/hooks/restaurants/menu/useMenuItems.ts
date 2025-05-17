
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItemMedia } from './useMenuItemMedia';

export const useMenuItems = (restaurantId: string | undefined) => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchMediaForMenuItem, fetchIngredientsForMenuItem } = useMenuItemMedia();

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching menu items for restaurant:", restaurantId);
        
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);
          
        if (menuError) {
          throw menuError;
        }
        
        if (menuData && menuData.length > 0) {
          console.log(`Found ${menuData.length} menu items for restaurant ${restaurantId}`);
          
          // For each menu item, fetch its ingredients and media items
          const itemsWithDetails = await Promise.all(menuData.map(async (item) => {
            console.log(`Processing menu item: ${item.name} (${item.id})`);
            
            // Fetch ingredients for this menu item
            const ingredients = await fetchIngredientsForMenuItem(item.id);
            
            // Try to get the media items associated with this menu item
            const media = await fetchMediaForMenuItem(restaurantId, item.id);
            
            // Transform to match our MenuItem interface
            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'Other', // Default type since it's not in the database
              ingredients: ingredients,
              media: media
            } as MenuItem;
          }));
          
          console.log(`Processed ${itemsWithDetails.length} menu items with details`);
          setMenuItems(itemsWithDetails);
        } else {
          console.log(`No menu items found for restaurant ${restaurantId}`);
          setMenuItems([]);
        }
      } catch (error: any) {
        console.error('Error fetching menu items:', error);
        setError(error.message || 'Failed to load menu items');
        toast({
          title: 'Error',
          description: error.message || 'Failed to load menu items',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [restaurantId, fetchMediaForMenuItem, fetchIngredientsForMenuItem, toast]);

  return { menuItems, setMenuItems, isLoading, error };
};
