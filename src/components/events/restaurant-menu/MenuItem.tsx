
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
        {/* Thumbnail */}
        {item.media && item.media.length > 0 && (
          <div className="mr-3">
            <MenuItemMedia media={item.media} className="mt-0" thumbnailOnly />
          </div>
        )}
        
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
