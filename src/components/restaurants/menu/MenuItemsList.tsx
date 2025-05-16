
import React from 'react';
import MenuItemCard, { MenuItem } from '@/components/restaurants/menu/MenuItemCard';

interface MenuItemsListProps {
  menuItems: MenuItem[];
  handleEditItem: (item: MenuItem) => void;
  handleDeleteItem: (itemId: string) => void;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({ menuItems, handleEditItem, handleDeleteItem }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {menuItems.length > 0 ? (
        menuItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        ))
      ) : (
        <div className="col-span-full py-12 text-center">
          <p className="text-muted-foreground">
            No menu items yet. Click "Add Menu Item" to create one.
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuItemsList;
