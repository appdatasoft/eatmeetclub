
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';

export const useMenuItemOperations = (
  restaurantId: string | undefined,
  userId: string | undefined,
  menuItems: MenuItem[],
  setMenuItems: (items: MenuItem[]) => void
) => {
  const { toast } = useToast();
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = () => {
    setCurrentItem(null);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      // Delete the menu item - the ingredients will be deleted via cascade
      const { error } = await supabase
        .from('restaurant_menu_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update the UI
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete menu item',
        variant: 'destructive'
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentItem(null);
  };

  return {
    currentItem,
    isDialogOpen,
    isSaving,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleDialogClose,
    setIsSaving,
    setCurrentItem,
    setIsDialogOpen
  };
};
