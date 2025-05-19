
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import MenuItemForm from '@/components/restaurants/menu/MenuItemForm';
import { MenuItem } from '@/types/menuItem';
import { MenuItemFormValues } from './types/menuTypes';

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: MenuItem | null;
  isSaving: boolean;
  onSave: (values: MenuItemFormValues) => Promise<boolean | void>;
  restaurantId: string;
}

const MenuItemDialog: React.FC<MenuItemDialogProps> = ({
  isOpen,
  onClose,
  currentItem,
  isSaving,
  onSave,
  restaurantId
}) => {
  // Handle dialog close with confirmation if there are unsaved changes
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // You could add confirmation here if needed
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {currentItem && currentItem.id ? 'Edit Menu Item' : 'Add Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {currentItem && currentItem.id ? 'Update the details of this menu item.' : 'Add a new item to your restaurant menu.'}
          </DialogDescription>
        </DialogHeader>
        <MenuItemForm
          initialValues={currentItem || undefined}
          onSubmit={onSave}
          isLoading={isSaving}
          onCancel={onClose}
          restaurantId={restaurantId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemDialog;
