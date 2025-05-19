import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/menuItem';
import { createOfflineCache } from '@/utils/fetch/localStorageCache';

const menuItemsCache = createOfflineCache<MenuItem[]>('menuItems');

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    setError(null);

    try {
      let cachedMenuItems = menuItemsCache.get();

      if (cachedMenuItems) {
        setMenuItems(cachedMenuItems);
        setLoading(false);
      }

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error);
        console.error("Supabase error:", error);
      } else {
        const fetchedMenuItems: MenuItem[] = data || [];
        setMenuItems(fetchedMenuItems);
        menuItemsCache.set(fetchedMenuItems);
      }
    } catch (err: any) {
      setError(err);
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMenuItems = async () => {
    const shouldRefresh = menuItemsCache.isStale();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error);
        console.error("Supabase error:", error);
      } else {
        const fetchedMenuItems: MenuItem[] = data || [];
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
      setLoading(false);
    }
  };

  return {
    menuItems,
    loading,
    error,
    refreshMenuItems,
  };
};
