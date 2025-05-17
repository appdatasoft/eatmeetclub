
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
      if (!restaurantId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);
          
        if (menuError) throw menuError;
        
        if (menuData) {
          // For each menu item, fetch its ingredients and media items
          const itemsWithDetails = await Promise.all(menuData.map(async (item) => {
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
              type: '', // Set a default empty string since type doesn't exist in the database
              ingredients: ingredients,
              media: media
            } as MenuItem;
          }));
          
          setMenuItems(itemsWithDetails);
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
    
    if (restaurantId) {
      fetchMenuItems();
    } else {
      setIsLoading(false);
    }
  }, [restaurantId, toast]);

  return { menuItems, setMenuItems, isLoading, error };
};
