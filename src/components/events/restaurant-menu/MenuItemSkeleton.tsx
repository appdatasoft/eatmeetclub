
import React from "react";

const MenuItemSkeleton: React.FC = () => (
  <div className="border-b pb-3">
    <div className="flex">
      {/* Thumbnail skeleton */}
      <div className="mr-3">
        <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export default MenuItemSkeleton;
