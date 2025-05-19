
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '../types';
import { fetchMenuItemMedia, fetchMenuItemIngredients } from '../utils/mediaUtils';
import { createSessionCache } from '@/utils/fetch';
import { get } from '@/lib/fetch-client';

export interface MenuFetcherResult {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useMenuItemsFetcher = (restaurantId: string): MenuFetcherResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempt, setFetchAttempt] = useState<number>(0);
  
  // Use a memoized fetch function to prevent unnecessary refetches
  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) {
      setError('No restaurant ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use session cache with improved key format to prevent multiple fetches and body stream read errors
      const cacheKey = `menu_items_${restaurantId}`;
      const cache = createSessionCache<MenuItem[]>(cacheKey, CACHE_DURATION, { 
        staleWhileRevalidate: true 
      });
      
      // Check cache first for immediate response
      const cachedItems = cache.get();
      if (cachedItems && cachedItems.length > 0) {
        console.log(`Using cached menu items for restaurant ${restaurantId}`);
        setMenuItems(cachedItems);
        setIsLoading(false);
        
        // If cache is stale, trigger a background refresh without blocking UI
        if (cache.isStale()) {
          console.log('Cache is stale, refreshing in background');
          setTimeout(() => {
            backgroundRefresh(restaurantId, cache);
          }, 100);
        }
        return;
      }
      
      console.log(`Fetching menu items for restaurant ${restaurantId}`);
      
      // Use the improved unified fetch client with retry capability
      const { data: menuData, error: menuError } = await get(
        `/api/restaurant-menu/${restaurantId}`,
        {
          fallbackToSupabase: true,
          supabseFallbackFn: async () => {
            const { data, error } = await supabase
              .from('restaurant_menu_items')
              .select('id, name, description, price')
              .eq('restaurant_id', restaurantId)
              .limit(50);
            
            if (error) throw error;
            return data || [];
          },
          cacheTime: CACHE_DURATION,
          retries: 2
        }
      );
      
      if (menuError) throw menuError;
      
      if (!menuData || !Array.isArray(menuData) || menuData.length === 0) {
        console.log('No menu items found');
        setMenuItems([]);
        cache.set([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${menuData.length} menu items`);
      
      // Process menu items with media and ingredients - in smaller batches to improve performance
      const processedItems = await processMenuItemsInBatches(menuData, restaurantId);
      
      // Set the processed items and update cache
      setMenuItems(processedItems);
      cache.set(processedItems);
      
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError(err.message || 'Failed to fetch menu items');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, fetchAttempt]);

  // Background refresh function to update data without blocking UI
  const backgroundRefresh = async (restaurantId: string, cache: ReturnType<typeof createSessionCache>) => {
    try {
      const { data: menuData } = await supabase
        .from('restaurant_menu_items')
        .select('id, name, description, price')
        .eq('restaurant_id', restaurantId)
        .limit(50);
      
      if (menuData && menuData.length > 0) {
        console.log(`Background refresh: Found ${menuData.length} menu items`);
        
        // Process in batches
        const processedItems = await processMenuItemsInBatches(menuData, restaurantId);
        
        // Compare to current items to avoid unnecessary updates
        const currentItems = cache.get() || [];
        const hasChanged = JSON.stringify(processedItems) !== JSON.stringify(currentItems);
        
        if (hasChanged) {
          console.log('Background refresh: Updating menu items');
          setMenuItems(processedItems);
          cache.set(processedItems);
        }
      }
    } catch (error) {
      console.error('Background refresh error:', error);
      // Don't update UI for background errors
    }
  };
  
  // Process menu items in smaller batches to improve performance
  const processMenuItemsInBatches = async (menuData: any[], restaurantId: string): Promise<MenuItem[]> => {
    const BATCH_SIZE = 5; // Process 5 items at a time
    const results: MenuItem[] = [];
    
    for (let i = 0; i < menuData.length; i += BATCH_SIZE) {
      const batch = menuData.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (item) => {
        try {
          // Fetch media for this item - fetch in parallel
          const [mediaItems, ingredientItems] = await Promise.all([
            fetchMenuItemMedia(restaurantId, item.id),
            fetchMenuItemIngredients(item.id)
          ]);
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            type: item.type || 'Other',
            restaurant_id: restaurantId,
            ingredients: ingredientItems || [],
            media: mediaItems || []
          } as MenuItem;
        } catch (err) {
          console.error(`Error processing menu item ${item.id}:`, err);
          // Return a partial item rather than failing completely
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            type: item.type || 'Other',
            restaurant_id: restaurantId,
            ingredients: [],
            media: []
          } as MenuItem;
        }
      });
      
      // Process this batch
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  };
  
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);
  
  return { menuItems, isLoading, error };
};
