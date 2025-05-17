
import React from "react";
import { MenuItem } from "./types";
import MenuItemMedia from "@/components/restaurants/menu/MenuItemMedia";

interface MenuItemProps {
  item: MenuItem;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item }) => {
  return (
    <div className="border-b pb-3">
      <div className="flex">
        {/* Thumbnail - always show at least a placeholder */}
        <div className="mr-3">
          {item.media && item.media.length > 0 ? (
            <MenuItemMedia media={item.media} className="mt-0" thumbnailOnly />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>
        
        {/* Item details */}
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium">{item.name}</h3>
            <span className="font-medium">${item.price.toFixed(2)}</span>
          </div>
          
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
          
          {item.ingredients && item.ingredients.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 italic">
              {item.ingredients.join(', ')}
            </p>
          )}
          
          {/* Show "View More" if there are multiple images */}
          {item.media && item.media.length > 1 && (
            <button 
              className="text-xs text-primary mt-1 hover:underline"
              onClick={() => {}}
            >
              +{item.media!.length - 1} more photos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemComponent;
