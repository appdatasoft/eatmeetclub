
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '../types';
import { fetchMenuItemMedia, fetchMenuItemIngredients } from '../utils/mediaUtils';
import { createSessionCache } from '@/utils/fetch';

export interface MenuFetcherResult {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
}

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
      
      // Use session cache to prevent multiple fetches and body stream read errors
      const cacheKey = `menu_items_${restaurantId}`;
      const cache = createSessionCache<MenuItem[]>(cacheKey, 5 * 60 * 1000, { 
        staleWhileRevalidate: true 
      });
      
      // Check cache first
      const cachedItems = cache.get();
      if (cachedItems && cachedItems.length > 0) {
        console.log(`Using cached menu items for restaurant ${restaurantId}`);
        setMenuItems(cachedItems);
        
        // If cache is stale, trigger a background refresh
        if (cache.isStale()) {
          console.log('Cache is stale, refreshing in background');
          setTimeout(() => setFetchAttempt(prev => prev + 1), 100);
        }
        
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching menu items for restaurant ${restaurantId}`);
      
      // Clone all responses to prevent "body stream already read" errors
      const { data, error: fetchError } = await supabase
        .from('restaurant_menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (fetchError) {
        console.error('Error fetching menu items:', fetchError);
        throw fetchError;
      }
      
      if (!data || data.length === 0) {
        console.log('No menu items found');
        setMenuItems([]);
        cache.set([]);
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${data.length} menu items`);
      
      // Process menu items with media and ingredients
      const processedItems = await Promise.all(data.map(async (item) => {
        try {
          // Fetch media for this item - using enhanced functions that handle response cloning
          const media = await fetchMenuItemMedia(restaurantId, item.id);
          
          // Fetch ingredients for this item - using enhanced functions that handle response cloning
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
        } catch (err) {
          console.error(`Error processing menu item ${item.id}:`, err);
          // Return a partial item rather than failing completely
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            type: 'Other',
            restaurant_id: restaurantId,
            ingredients: [],
            media: []
          };
        }
      }));
      
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
  
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);
  
  return { menuItems, isLoading, error };
};
