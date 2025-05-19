
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/menuItem';
import { createOfflineCache } from '@/utils/fetch/localStorageCache';

const menuItemsCache = createOfflineCache<MenuItem[]>('menuItems');

export const useMenuItems = (restaurantId?: string, retryTrigger = 0) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (restaurantId) {
      loadMenuItems();
    }
  }, [restaurantId, retryTrigger]);

  const loadMenuItems = async () => {
    if (!restaurantId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let cachedMenuItems = menuItemsCache.get();

      if (cachedMenuItems) {
        setMenuItems(cachedMenuItems);
        setIsLoading(false);
      }

      const { data, error } = await supabase
        .from('restaurant_menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error);
        console.error("Supabase error:", error);
      } else {
        const fetchedMenuItems: MenuItem[] = (data || []).map(item => ({
          ...item,
          type: item.type || 'Other', // Default type if not present
          ingredients: [],
          media: []
        }));
        setMenuItems(fetchedMenuItems);
        menuItemsCache.set(fetchedMenuItems);
      }
    } catch (err: any) {
      setError(err);
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMenuItems = async () => {
    const shouldRefresh = menuItemsCache.isStale();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('restaurant_menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error);
        console.error("Supabase error:", error);
      } else {
        const fetchedMenuItems: MenuItem[] = (data || []).map(item => ({
          ...item,
          type: item.type || 'Other', // Default type if not present
          ingredients: [],
          media: []
        }));
        setMenuItems(fetchedMenuItems);
        if (shouldRefresh) {
          menuItemsCache.del();
        }
        menuItemsCache.set(fetchedMenuItems);
      }
    } catch (err: any) {
      setError(err);
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Added function for retrying fetch
  const retryFetch = async () => {
    await loadMenuItems();
  };

  return {
    menuItems,
    isLoading,
    error,
    refreshMenuItems,
    setMenuItems,
    retryFetch
  };
};
