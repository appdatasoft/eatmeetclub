import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

export const useMenuSelections = (
  eventId: string,
  restaurantId: string,
  userId: string | undefined,
  onClose: () => void
) => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!eventId || !restaurantId) return;

    const controller = new AbortController();
    const load = async () => {
      try {
        await fetchMenuItems(controller.signal);
        if (userId) await fetchUserSelections();
      } catch (err) {
        // Already handled in fetch functions
      }
    };

    load();
    return () => controller.abort(); // Cancel on cleanup
  }, [eventId, restaurantId, userId]);

  const fetchMenuItems = async (signal: AbortSignal) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('restaurant_menu_items')
        .select('id, name, description, price')
        .eq('restaurant_id', restaurantId)
        .order('name');

      if (signal.aborted) return;

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Error fetching menu items:', error.message || error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSelections = async () => {
    try {
      const { data, error } = await supabase
        .from('event_menu_selections')
        .select('menu_item_id')
        .eq('event_id', eventId)
        .eq('user_id', userId!);

      if (error) throw error;

      const selected = (data as { menu_item_id: string }[])?.map(item => item.menu_item_id) || [];
      setSelectedItems(selected);
    } catch (error: any) {
      console.error('Error fetching user selections:', error.message || error);
    }
  };

  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSave = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to select menu items.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      await supabase
        .from('event_menu_selections')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (selectedItems.length > 0) {
        const selections = selectedItems.map(menu_item_id => ({
          event_id: eventId,
          user_id: userId,
          menu_item_id,
        }));

        const { error } = await supabase
          .from('event_menu_selections')
          .insert(selections);

        if (error) throw error;
      }

      toast({
        title: 'Selections Saved',
        description: 'Your menu selections have been saved.',
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving menu selections:', error.message || error);
      toast({
        title: 'Error',
        description: 'Failed to save your selections.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    menuItems,
    selectedItems,
    loading,
    saving,
    toggleSelection,
    handleSave,
  };
};
