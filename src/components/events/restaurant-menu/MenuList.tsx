
import React from "react";
import { MenuItem } from "./types";
import { Separator } from "@/components/ui/separator";
import MenuListItem from "./components/MenuListItem";

interface MenuListProps {
  menuItems: MenuItem[];
}

const MenuList: React.FC<MenuListProps> = ({ menuItems }) => {
  if (!menuItems || menuItems.length === 0) {
    return <p className="text-center py-4 text-gray-500">No menu items available</p>;
  }
  
  // Group menu items by type
  const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>((groups, item) => {
    const type = item.type || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {});
  
  // Sort types for consistent display
  const types = Object.keys(groupedItems).sort();
  
  return (
    <div className="space-y-6">
      {types.map((type, index) => (
        <div key={type} className="menu-section">
          <h3 className="text-lg font-medium mb-3">{type}</h3>
          <div className="space-y-3">
            {groupedItems[type].map(item => (
              <MenuListItem key={item.id} item={item} />
            ))}
          </div>
          {index < types.length - 1 && (
            <Separator className="mt-4" />
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuList;
