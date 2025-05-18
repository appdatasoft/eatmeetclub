
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useMenuSelections } from './useMenuSelections';
import MenuSelectionHeader from './MenuSelectionHeader';
import MenuItemsList from './MenuItemsList';
import MenuSelectionFooter from './MenuSelectionFooter';

interface MenuSelectionModalProps {
  eventId: string;
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

const MenuSelectionModal: React.FC<MenuSelectionModalProps> = ({
  eventId,
  restaurantId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const {
    menuItems,
    selectedItems,
    loading,
    saving,
    toggleSelection,
    handleSave
  } = useMenuSelections(eventId, restaurantId, user?.id, onClose);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <MenuSelectionHeader />
        
        <MenuItemsList 
          menuItems={menuItems}
          selectedItems={selectedItems}
          loading={loading}
          onToggleItem={toggleSelection}
        />
        
        <MenuSelectionFooter 
          selectedCount={selectedItems.length}
          saving={saving}
          onCancel={onClose}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MenuSelectionModal;
