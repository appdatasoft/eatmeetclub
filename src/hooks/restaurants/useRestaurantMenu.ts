
import { useAuth } from '@/hooks/useAuth';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';
import { useMenuItemsFetch } from './menu/useMenuItemsFetch';
import { useMenuItemOperations } from './menu/useMenuItemOperations';
import { useMenuItemSave } from './menu/useMenuItemSave';

export const useRestaurantMenu = (restaurantId: string | undefined) => {
  const { user } = useAuth();
  
  // Use the separate hooks
  const { restaurant, menuItems, isLoading, isOwner, setMenuItems } = 
    useMenuItemsFetch(restaurantId, user?.id);
    
  const {
    currentItem,
    isDialogOpen,
    isSaving: operationsSaving,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleDialogClose,
    setIsDialogOpen,
    setIsSaving: setOperationsSaving
  } = useMenuItemOperations(restaurantId, user?.id, menuItems, setMenuItems);
  
  const { 
    handleSaveItem, 
    isSaving: saveSaving,
    setIsSaving: setSaveSaving
  } = useMenuItemSave(
    restaurantId, 
    user?.id,
    menuItems,
    setMenuItems,
    currentItem,
    setIsDialogOpen
  );
  
  // Combine the isSaving states
  const isSaving = operationsSaving || saveSaving;

  return {
    restaurant,
    menuItems,
    isLoading,
    isSaving,
    isDialogOpen,
    currentItem,
    isOwner,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleSaveItem,
    handleDialogClose
  };
};
