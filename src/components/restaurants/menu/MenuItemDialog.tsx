
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import MenuItemForm from '@/components/restaurants/menu/MenuItemForm';
import { MenuItem } from '@/types/menuItem';
import { MenuItemFormValues } from './types/menuTypes';
import { MediaItem as UIMediaItem } from './types/mediaTypes';

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

  // Convert MenuItem to MenuItemFormValues
  const formValues = currentItem ? {
    id: currentItem.id,
    name: currentItem.name,
    description: currentItem.description || '',
    price: currentItem.price,
    type: currentItem.type || 'Other',
    ingredients: currentItem.ingredients || [''],
    // Convert MediaItem from backend format to UI format
    media: currentItem.media ? currentItem.media.map(m => ({
      id: m.id,
      url: m.url,
      type: m.media_type === 'image' ? 'image' : 'video',
      media_type: m.media_type,
      menu_item_id: m.menu_item_id
    } as UIMediaItem)) : []
  } : undefined;

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
          initialValues={formValues}
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
