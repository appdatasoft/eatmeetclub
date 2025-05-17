
import React, { useState } from "react";
import { MenuItem } from "./types";
import MenuItemMedia from "@/components/restaurants/menu/MenuItemMedia";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MenuItemProps {
  item: MenuItem;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  
  const hasMedia = item.media && item.media.length > 0;
  
  return (
    <div className="border-b pb-3">
      <div className="flex">
        {/* Thumbnail - always show at least a placeholder */}
        <div className="mr-3">
          {hasMedia ? (
            <div 
              className="w-16 h-16 rounded-md overflow-hidden cursor-pointer"
              onClick={() => setShowAllPhotos(true)}
            >
              <img 
                src={item.media[0].url} 
                alt={item.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop";
                }}
              />
            </div>
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
          {hasMedia && item.media.length > 1 && (
            <button 
              className="text-xs text-primary mt-1 hover:underline"
              onClick={() => setShowAllPhotos(true)}
            >
              +{item.media.length - 1} more photos
            </button>
          )}
        </div>
      </div>
      
      {/* Full Media Gallery Dialog */}
      <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
        <DialogContent className="sm:max-w-3xl">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{item.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasMedia && item.media.map((media, idx) => (
                <div key={idx} className="rounded-md overflow-hidden">
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt={`${item.name} photo ${idx+1}`} 
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop";
                      }}
                    />
                  ) : (
                    <video 
                      src={media.url} 
                      controls
                      className="w-full h-64 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItemComponent;
