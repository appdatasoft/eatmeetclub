
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItemDialog } from './useMenuItemDialog';
import { useMenuItemDelete } from './useMenuItemDelete';
import { useMenuItemSave } from './useMenuItemSave';

export const useMenuItemOperations = (
  restaurantId: string | undefined,
  userId: string | undefined,
  menuItems: MenuItem[],
  setMenuItems: (items: MenuItem[]) => void
) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Use specialized hooks for different operations
  const {
    currentItem,
    isDialogOpen,
    handleAddItem,
    handleEditItem,
    handleDialogClose,
    setCurrentItem,
    setIsDialogOpen
  } = useMenuItemDialog(menuItems);
  
  const { handleDeleteItem } = useMenuItemDelete(
    restaurantId || '',
    menuItems,
    setMenuItems,
    toast
  );
  
  const { handleSaveItem } = useMenuItemSave(
    restaurantId || '',
    menuItems,
    setMenuItems,
    setIsDialogOpen,
    toast,
    setIsSaving
  );

  return {
    currentItem,
    isDialogOpen,
    isSaving,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleDialogClose,
    handleSaveItem,
    setIsSaving,
    setCurrentItem,
    setIsDialogOpen
  };
};
