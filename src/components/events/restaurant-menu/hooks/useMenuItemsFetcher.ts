
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '../types';
import { fetchMenuItemMedia, fetchMenuItemIngredients } from '../utils/mediaUtils';

export interface MenuFetcherResult {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
}

export const useMenuItemsFetcher = (restaurantId: string): MenuFetcherResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        setError('No restaurant ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch menu items from the database
        const { data, error: fetchError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);
        
        if (fetchError) throw fetchError;
        
        if (!data || data.length === 0) {
          // No menu items found
          setMenuItems([]);
          setIsLoading(false);
          return;
        }
        
        // Process menu items with media and ingredients
        const processedItems = await Promise.all(data.map(async (item) => {
          // Fetch media for this item - pass the ID as string, not the whole item
          const media = await fetchMenuItemMedia(restaurantId, item.id);
          
          // Fetch ingredients for this item
          const ingredients = await fetchMenuItemIngredients(item.id);
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            type: 'Other',
            restaurant_id: restaurantId,
            ingredients,
            media
          };
        }));
        
        setMenuItems(processedItems);
      } catch (err: any) {
        console.error('Error fetching menu items:', err);
        setError(err.message || 'Failed to fetch menu items');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [restaurantId]);
  
  return { menuItems, isLoading, error };
};
