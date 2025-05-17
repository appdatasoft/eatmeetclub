
import React, { useState } from "react";
import { MenuItem } from "./types";
import ItemThumbnail from "./components/ItemThumbnail";
import ItemDetails from "./components/ItemDetails";
import MediaGalleryDialog from "./components/MediaGalleryDialog";

interface MenuItemProps {
  item: MenuItem;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item }) => {
  const [showGallery, setShowGallery] = useState(false);
  
  return (
    <div className="border-b pb-3">
      <div className="flex">
        {/* Thumbnail - always show at least a placeholder */}
        <div className="mr-3">
          <ItemThumbnail 
            media={item.media} 
            itemName={item.name} 
            onOpenGallery={() => setShowGallery(true)} 
          />
        </div>
        
        {/* Item details */}
        <ItemDetails 
          item={item} 
          onOpenGallery={() => setShowGallery(true)} 
        />
      </div>
      
      {/* Image Gallery Dialog */}
      <MediaGalleryDialog 
        item={item} 
        open={showGallery} 
        onOpenChange={setShowGallery} 
      />
    </div>
  );
};

export default MenuItemComponent;
