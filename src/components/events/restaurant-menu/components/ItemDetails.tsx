
import React from "react";
import { MenuItem } from "../types";

interface ItemDetailsProps {
  item: MenuItem;
  onOpenGallery: () => void;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ item, onOpenGallery }) => {
  // Format price to display with 2 decimal places
  const formattedPrice = `$${item.price.toFixed(2)}`;
  
  // Format ingredients list if available
  const hasIngredients = item.ingredients && item.ingredients.length > 0;
  
  // Check if item has media
  const hasMedia = item.media && item.media.length > 0;
  
  return (
    <div className="flex-grow">
      <div className="flex justify-between">
        <h3 className="font-medium">{item.name}</h3>
        <span className="font-medium">{formattedPrice}</span>
      </div>
      
      {item.description && (
        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
      )}
      
      {hasIngredients && (
        <p className="text-xs text-gray-500 italic mt-1">
          {item.ingredients.join(', ')}
        </p>
      )}
      
      {hasMedia && item.media!.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenGallery();
          }}
          className="text-xs text-primary-600 mt-2 hover:underline"
          aria-label="View all images"
        >
          {item.media!.length} photos
        </button>
      )}
    </div>
  );
};

export default ItemDetails;
