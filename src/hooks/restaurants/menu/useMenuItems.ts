
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItemMedia } from '@/hooks/restaurants/menu/useMenuItemMedia';
import { useMenuItemsProcessor } from './useMenuItemsProcessor';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { useToast } from '@/hooks/use-toast';

export const useMenuItems = (restaurantId: string | undefined, retryTrigger: number = 0) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  
  const { toast } = useToast();
  const { fetchMediaForMenuItem, fetchIngredientsForMenuItem } = useMenuItemMedia();
  const { processMenuItems } = useMenuItemsProcessor(fetchMediaForMenuItem, fetchIngredientsForMenuItem);

  // This effect runs when restaurantId or retryTrigger changes
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
        console.log(`Fetching menu items for restaurant: ${restaurantId} (attempt: ${fetchCount})`);

        // Use cache for very recent data to avoid loading spinner flash
        const cacheKey = `menu_items_${restaurantId}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        if (cachedData && retryTrigger === 0) {
          try {
            const { data, timestamp } = JSON.parse(cachedData);
            // Use cache only if less than 30 seconds old
            if (Date.now() - timestamp < 30000) {
              console.log('Using cached menu items data');
              setMenuItems(data);
              setIsLoading(false);
              setIsRetrying(false);
              return;
            }
          } catch (e) {
            console.warn("Error parsing cached menu items", e);
            sessionStorage.removeItem(cacheKey);
          }
        }

        // Fetch menu items with enhanced retry logic
        const { data: menuData, error: menuError } = await fetchWithRetry(async () => {
          return await supabase
            .from('restaurant_menu_items')
            .select('*')
            .eq('restaurant_id', restaurantId);
        }, {
          retries: 5,
          baseDelay: 1000,
          maxDelay: 15000
        });

        if (menuError) throw menuError;

        if (menuData && menuData.length > 0) {
          console.log(`Found ${menuData.length} menu items`);
          
          // Process the menu items with the dedicated processor
          const processed = await processMenuItems(menuData, restaurantId);
          setMenuItems(processed);
          
          // Cache the processed data
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: processed,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.warn("Could not cache menu items data", e);
          }
        } else {
          console.log('No menu items found');
          setMenuItems([]);
        }
        
        // Clear any previous errors
        setError(null);
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
        setFetchCount(prev => prev + 1);
      }
    };

    fetchMenuItems();
  }, [restaurantId, retryTrigger, processMenuItems, toast, fetchCount]);

  // Add a retry function for manual retry
  const retryFetch = async () => {
    setError(null);
    setIsLoading(true);
    
    // Clear the cache to force a fresh fetch
    if (restaurantId) {
      sessionStorage.removeItem(`menu_items_${restaurantId}`);
    }
    
    // Force a new fetch by updating fetchCount
    setFetchCount(prev => prev + 1);
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
