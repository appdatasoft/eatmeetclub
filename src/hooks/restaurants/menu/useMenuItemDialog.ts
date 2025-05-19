
import { useState } from 'react';
import { MenuItem } from '@/types/menuItem';

export const useMenuItemDialog = (menuItems: MenuItem[]) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);

  // Handle add new item
  const handleAddItem = () => {
    setCurrentItem({
      id: '',
      name: '',
      description: '',
      price: 0,
      type: 'Other',
      restaurant_id: '',
      ingredients: [],
      media: []
    });
    setIsDialogOpen(true);
  };
  
  // Handle edit item
  const handleEditItem = (item: MenuItem) => {
    console.log('Editing item:', item);
    
    // Ensure we have the complete item data with media
    const fullItem = menuItems.find(mi => mi.id === item.id);
    
    if (fullItem) {
      console.log('Full item data for editing:', fullItem);
      setCurrentItem(fullItem);
    } else {
      console.log('Item not found in menuItems, using provided item');
      setCurrentItem(item);
    }
    
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentItem(null);
  };

  return {
    isDialogOpen,
    currentItem,
    handleAddItem,
    handleEditItem,
    handleDialogClose,
    setIsDialogOpen,
    setCurrentItem
  };
};
