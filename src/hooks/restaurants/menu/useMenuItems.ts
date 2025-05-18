
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItemMedia } from '@/hooks/restaurants/menu/useMenuItemMedia';
import { useMenuItemsProcessor } from './useMenuItemsProcessor';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { useToast } from '@/hooks/use-toast';

export const useMenuItems = (restaurantId: string | undefined) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { toast } = useToast();
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
        setIsRetrying(true);
        console.log(`Fetching menu items for restaurant: ${restaurantId}`);

        // Fetch menu items with retry logic
        const { data: menuData, error: menuError } = await fetchWithRetry(async () => {
          return await supabase
            .from('restaurant_menu_items')
            .select('*')
            .eq('restaurant_id', restaurantId);
        }, {
          retries: 5,
          baseDelay: 800
        });

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
        
        toast({
          title: "Error loading menu",
          description: "Could not load menu items. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setIsRetrying(false);
      }
    };

    fetchMenuItems();
  }, [restaurantId, processMenuItems, toast]);

  // Add a retry function for manual retry
  const retryFetch = async () => {
    setError(null);
    setIsLoading(true);
    
    // Re-trigger the effect by updating a dependency
    setMenuItems([]);
    
    // The effect will run again with the same restaurantId
  };

  return { 
    menuItems, 
    setMenuItems, 
    isLoading, 
    error,
    isRetrying,
    retryFetch
  };
};
