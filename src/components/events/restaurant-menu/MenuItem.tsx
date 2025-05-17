
import React, { useState } from "react";
import type { MenuItem } from "./types";
import ItemThumbnail from "./components/ItemThumbnail";
import ItemDetails from "./components/ItemDetails";
import MediaGalleryDialog from "./components/MediaGalleryDialog";

interface MenuItemProps {
  item: MenuItem;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const hasMedia = item.media && item.media.length > 0;

  const handleOpenGallery = () => {
    if (hasMedia) {
      setIsGalleryOpen(true);
    }
  };

  return (
    <div className="border-b border-gray-200 py-4 last:border-none">
      <div className="flex items-start gap-3">
        {/* Thumbnail with navigation now rendered below */}
        <div className="flex-shrink-0">
          {hasMedia ? (
            <ItemThumbnail 
              media={item.media} 
              name={item.name}
              onClick={handleOpenGallery}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-xs text-gray-400">No image</span>
            </div>
          )}
        </div>

        {/* Item Details */}
        <ItemDetails 
          item={item} 
          onOpenGallery={handleOpenGallery}
        />
      </div>

      {/* Full Gallery Dialog */}
      <MediaGalleryDialog
        item={item}
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
      />
    </div>
  );
};

export default MenuItemComponent;
