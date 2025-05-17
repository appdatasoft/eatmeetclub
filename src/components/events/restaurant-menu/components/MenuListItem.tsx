
import React, { useState } from "react";
import { MenuItem } from "../types";
import ItemThumbnail from "./ItemThumbnail";
import ItemDetails from "./ItemDetails";

interface MenuListItemProps {
  item: MenuItem;
}

const MenuListItem: React.FC<MenuListItemProps> = ({ item }) => {
  const [showGallery, setShowGallery] = useState(false);
  
  const hasMedia = item.media && item.media.length > 0;
  
  const handleOpenGallery = () => {
    setShowGallery(true);
  };
  
  return (
    <div className="flex items-start p-3 rounded-md border hover:bg-gray-50 transition-colors">
      {hasMedia ? (
        <ItemThumbnail 
          media={item.media!} 
          name={item.name}
          onClick={handleOpenGallery}
        />
      ) : (
        <ItemThumbnail 
          media={[]}
          name={item.name}
          onClick={() => {}}
        />
      )}
      
      <div className="ml-4 flex-grow">
        <ItemDetails 
          item={item}
          onOpenGallery={hasMedia ? handleOpenGallery : undefined}
        />
      </div>
    </div>
  );
};

export default MenuListItem;
