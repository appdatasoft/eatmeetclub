
import { MenuItemFormValues } from '@/components/restaurants/menu/types/menuTypes';
import { MenuItem } from '@/types/menuItem';
import { createMenuItem, updateMenuItem } from './utils/menuItemCrud';

/**
 * Hook for handling menu item save operations (create/update)
 */
export const useMenuItemSave = (
  restaurantId: string,
  menuItems: MenuItem[],
  setMenuItems: (items: MenuItem[]) => void,
  setIsDialogOpen: (value: boolean) => void,
  toast: any,
  setIsSaving: (value: boolean) => void
) => {
  
  const handleSaveItem = async (formData: MenuItemFormValues): Promise<boolean> => {
    if (!restaurantId) return false;
    
    try {
      setIsSaving(true);
      const isNewItem = !formData.id;
      
      // Filter out empty ingredients
      const filteredIngredients = (formData.ingredients || []).filter(ing => ing.trim() !== '');
      
      if (isNewItem) {
        return await createMenuItem(
          restaurantId,
          formData,
          filteredIngredients,
          menuItems,
          setMenuItems,
          toast
        );
      } else if (formData.id) {
        return await updateMenuItem(
          restaurantId,
          formData.id,
          formData,
          filteredIngredients,
          menuItems,
          setMenuItems,
          toast
        );
      }
      
      return false;
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      
      toast({
        title: "Save Failed",
        description: err.message || "Could not save menu item",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSaveItem };
};

// Export static methods for direct usage
useMenuItemSave.createMenuItem = createMenuItem;
useMenuItemSave.updateMenuItem = updateMenuItem;
