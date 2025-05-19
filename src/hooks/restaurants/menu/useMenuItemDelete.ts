
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/menuItem';

export const useMenuItemDelete = (
  restaurantId: string,
  menuItems: MenuItem[],
  setMenuItems: (items: MenuItem[]) => void,
  toast: any
) => {
  const handleDeleteItem = async (itemId: string): Promise<boolean> => {
    if (!restaurantId) return false;
    
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
        title: "Item Deleted",
        description: "Menu item has been removed",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      
      toast({
        title: "Failed to Delete",
        description: "Could not remove the menu item. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  return { handleDeleteItem };
};
