
import React from "react";
import MenuItemSkeleton from "./MenuItemSkeleton";

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-white h-full p-4 overflow-y-auto">
      <div className="animate-pulse space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        {[1, 2, 3].map((i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
