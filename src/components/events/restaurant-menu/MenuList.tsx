
import React from "react";
import MenuItem from "./MenuItem";
import type { MenuItem as MenuItemType } from "./types";

interface MenuListProps {
  menuItems: MenuItemType[];
}

const MenuList: React.FC<MenuListProps> = ({ menuItems }) => {
  return (
    <div className="space-y-1">
      {menuItems.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default MenuList;
