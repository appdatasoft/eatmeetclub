
import React from "react";

const MenuItemSkeleton: React.FC = () => (
  <div className="space-y-2">
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

export default MenuItemSkeleton;
