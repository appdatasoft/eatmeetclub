
import React from "react";
import { MenuItem } from "./types";
import MenuItemComponent from "./MenuItem";

interface MenuListProps {
  menuItems: MenuItem[];
}

const MenuList: React.FC<MenuListProps> = ({ menuItems }) => {
  return (
    <div className="space-y-4">
      {menuItems.map((item) => (
        <MenuItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
};

export default MenuList;
