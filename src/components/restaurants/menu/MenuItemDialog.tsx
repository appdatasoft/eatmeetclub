
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MenuItemForm, { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: MenuItem | null;
  isSaving: boolean;
  onSave: (values: MenuItemFormValues) => Promise<void>;
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-white border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {currentItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </DialogTitle>
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
