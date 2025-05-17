
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItems } from '@/hooks/restaurants/menu/useMenuItems';
import { useRestaurantFetch } from '@/hooks/restaurants/useRestaurantFetch';
import { useMenuItemDialog } from '@/hooks/restaurants/menu/useMenuItemDialog';
import { useMenuItemSave } from '@/hooks/restaurants/menu/useMenuItemSave';
import { useMenuItemDelete } from '@/hooks/restaurants/menu/useMenuItemDelete';
import { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';

export interface Restaurant {
  id: string;
  name: string;
  user_id: string;
}

export const useRestaurantMenu = (restaurantId: string | undefined) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use our new hooks
  const { restaurant, isLoading: restaurantLoading, error, isOwner } = useRestaurantFetch(restaurantId);
  const { menuItems, setMenuItems, isLoading: menuItemsLoading } = useMenuItems(restaurantId);
  const { 
    isDialogOpen, 
    currentItem, 
    handleAddItem, 
    handleEditItem, 
    handleDialogClose, 
    setIsDialogOpen,
    setCurrentItem 
  } = useMenuItemDialog(menuItems);
  const { handleDeleteItem } = useMenuItemDelete(restaurantId || '', menuItems, setMenuItems, toast);
  
  // Handle save item
  const handleSaveItem = async (item: MenuItemFormValues): Promise<boolean | void> => {
    if (!restaurantId || !user?.id) return;
    
    try {
      setIsSaving(true);
      
      const isNewItem = !currentItem || !currentItem.id;
      console.log('Saving menu item:', isNewItem ? 'new item' : 'update item', item);
      
      // Filter out empty ingredients
      const filteredIngredients = (item.ingredients || []).filter(ing => ing.trim() !== '');
      
      // Use the appropriate save function based on whether this is a new item or an update
      if (isNewItem) {
        const result = await useMenuItemSave.createMenuItem(
          restaurantId,
          item,
          filteredIngredients,
          menuItems,
          setMenuItems,
          toast
        );
        if (result) {
          setIsDialogOpen(false);
          setCurrentItem(null);
          return true;
        }
      } else if (currentItem) {
        const result = await useMenuItemSave.updateMenuItem(
          restaurantId,
          currentItem.id,
          item,
          filteredIngredients,
          menuItems,
          setMenuItems,
          toast
        );
        if (result) {
          setIsDialogOpen(false);
          setCurrentItem(null);
          return true;
        }
      }
      
      return false;
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save menu item",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    restaurant,
    menuItems,
    isLoading: restaurantLoading || menuItemsLoading,
    isSaving,
    error,
    isOwner,
    isDialogOpen,
    currentItem,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleSaveItem,
    handleDialogClose
  };
};
