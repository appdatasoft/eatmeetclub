
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItemMedia } from '@/hooks/restaurants/menu/useMenuItemMedia';
import { useMenuItemsProcessor } from './useMenuItemsProcessor';
import { fetchWithRetry, createSessionCache } from '@/utils/fetch';
import { useToast } from '@/hooks/use-toast';

export const useMenuItems = (restaurantId: string | undefined, retryTrigger: number = 0) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  
  const { toast } = useToast();
  const { fetchMediaForMenuItem, fetchIngredientsForMenuItem } = useMenuItemMedia();
  const { processMenuItems } = useMenuItemsProcessor(
    // Make sure we properly type these functions
    (restaurantId: string, menuItemId: string) => fetchMediaForMenuItem(restaurantId, menuItemId),
    (menuItemId: string) => fetchIngredientsForMenuItem(menuItemId)
  );

  // This function fetches menu items with retries and caching
  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) {
      setIsLoading(false);
      setMenuItems([]);
      return;
    }

    try {
      setIsLoading(true);
      setIsRetrying(true);
      console.log(`Fetching menu items for restaurant: ${restaurantId} (attempt: ${fetchCount})`);

      // Use advanced session cache
      const cacheKey = `menu_items_${restaurantId}`;
      const cache = createSessionCache<MenuItem[]>(cacheKey, 10 * 60 * 1000, {
        staleWhileRevalidate: true
      }); // 10 minutes
      
      if (retryTrigger === 0) {
        const cachedData = cache.get();
        if (cachedData) {
          console.log('Using cached menu items data');
          setMenuItems(cachedData);
          setIsLoading(false);
          setIsRetrying(false);
          
          // Even though we're using cache, trigger a background refresh
          // to keep data fresh without blocking the UI
          if (cache.isStale()) {
            console.log('Cached data is stale, refreshing in background');
            setTimeout(() => {
              refreshMenuItemsInBackground(restaurantId, cache, cachedData);
            }, 100);
          }
          
          return;
        }
      }

      // Fetch menu items with enhanced retry logic
      const { data: menuData, error: menuError } = await fetchWithRetry(async () => {
        const response = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);
          
        // Handle potential errors manually to avoid passing error objects that might lose properties
        if (response.error) {
          throw new Error(response.error.message || "Failed to fetch menu items");
        }
        
        return response;
      }, {
        retries: 3,
        baseDelay: 1500,
        maxDelay: 10000
      });

      if (menuError) throw menuError;

      if (menuData && menuData.length > 0) {
        console.log(`Found ${menuData.length} menu items`);
        
        // Process the menu items with the dedicated processor
        const processed = await processMenuItems(menuData, restaurantId);
        setMenuItems(processed);
        
        // Cache the processed data
        cache.set(processed);
      } else {
        console.log('No menu items found');
        setMenuItems([]);
        // Cache empty array to prevent repeated fetches
        cache.set([]);
      }
      
      // Clear any previous errors
      setError(null);
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError(err.message || 'Failed to load menu items');
      
      toast({
        title: "Error loading menu",
        description: "Could not load menu items. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
      setFetchCount(prev => prev + 1);
    }
  }, [restaurantId, retryTrigger, processMenuItems, toast, fetchCount]);

  // Background refresh function that doesn't affect the UI state
  const refreshMenuItemsInBackground = async (
    restaurantId: string, 
    cache: ReturnType<typeof createSessionCache>,
    currentItems: MenuItem[]
  ) => {
    try {
      console.log("Refreshing menu items in background");
      const { data: menuData, error: menuError } = await supabase
        .from('restaurant_menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);
        
      if (menuError) throw menuError;
      
      if (menuData && menuData.length > 0) {
        const processed = await processMenuItems(menuData, restaurantId);
        
        // Only update if there's an actual difference
        const hasChanged = JSON.stringify(processed) !== JSON.stringify(currentItems);
        
        if (hasChanged) {
          console.log("Background refresh found updated data, updating...");
          setMenuItems(processed);
          cache.set(processed);
        } else {
          console.log("Background refresh found no changes");
        }
      }
    } catch (err) {
      console.error("Background refresh failed:", err);
      // Don't show UI errors for background refreshes
    }
  };

  // This effect runs when restaurantId or retryTrigger changes
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Add a retry function for manual retry
  const retryFetch = async () => {
    setError(null);
    setIsLoading(true);
    
    // Clear the cache to force a fresh fetch
    if (restaurantId) {
      const cacheKey = `menu_items_${restaurantId}`;
      const cache = createSessionCache<MenuItem[]>(cacheKey, 0);
      cache.remove();
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
