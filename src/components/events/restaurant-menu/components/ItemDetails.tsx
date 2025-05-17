
import React from "react";
import { GalleryHorizontal } from "lucide-react";
import { MenuItem } from "../types";

interface ItemDetailsProps {
  item: MenuItem;
  onOpenGallery: () => void;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ item, onOpenGallery }) => {
  const hasMultipleMedia = item.media && item.media.length > 1;
  
  return (
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
      
      {/* Show "View Gallery" if there are multiple images */}
      {hasMultipleMedia && (
        <button 
          className="text-xs text-primary mt-1 hover:underline flex items-center"
          onClick={onOpenGallery}
          aria-label={`View gallery of ${item.media.length} images for ${item.name}`}
        >
          <GalleryHorizontal className="h-3 w-3 mr-1" aria-hidden="true" />
          View gallery
        </button>
      )}
    </div>
  );
};

export default ItemDetails;
