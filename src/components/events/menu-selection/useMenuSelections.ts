
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
    if (eventId && restaurantId) {
      fetchMenuItems();
      fetchUserSelections();
    }
  }, [eventId, restaurantId, userId]);
  
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('restaurant_menu_items')
        .select('id, name, description, price')
        .eq('restaurant_id', restaurantId)
        .order('name');
        
      if (error) throw error;
      
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserSelections = async () => {
    if (!userId) return;
    
    try {
      // Using type assertion to bypass TypeScript errors
      const { data, error } = await (supabase as any)
        .from('event_menu_selections')
        .select('menu_item_id')
        .eq('event_id', eventId)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Safely access the data with type assertion
      const selected = (data as { menu_item_id: string }[])?.map(item => item.menu_item_id) || [];
      setSelectedItems(selected);
    } catch (error) {
      console.error('Error fetching user selections:', error);
    }
  };
  
  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  const handleSave = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to select menu items.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // First delete all existing selections using type assertion
      await (supabase as any)
        .from('event_menu_selections')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);
      
      // Then insert new selections
      if (selectedItems.length > 0) {
        const selections = selectedItems.map(menuItemId => ({
          event_id: eventId,
          user_id: userId,
          menu_item_id: menuItemId
        }));
        
        // Using type assertion to bypass TypeScript errors
        const { error } = await (supabase as any)
          .from('event_menu_selections')
          .insert(selections);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Selections Saved',
        description: 'Your menu selections have been saved.',
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving menu selections:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your selections.',
        variant: 'destructive'
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
    handleSave
  };
};
