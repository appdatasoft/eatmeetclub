
import React, { useState, useEffect } from "react";
import { MenuItem } from "./types";
import MenuItemMedia from "@/components/restaurants/menu/MenuItemMedia";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image } from "lucide-react";

interface MenuItemProps {
  item: MenuItem;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const hasMedia = item.media && item.media.length > 0;

  // Debug logging for media
  useEffect(() => {
    console.log(`MenuItem component for ${item.name}:`, {
      hasMedia,
      firstMediaUrl: hasMedia ? item.media[0].url : 'none',
      mediaCount: hasMedia ? item.media.length : 0
    });
  }, [item, hasMedia]);
  
  return (
    <div className="border-b pb-3">
      <div className="flex">
        {/* Thumbnail - always show at least a placeholder */}
        <div className="mr-3">
          {hasMedia ? (
            <div 
              className="w-16 h-16 rounded-md overflow-hidden cursor-pointer relative"
              onClick={() => setShowAllPhotos(true)}
            >
              {/* Show loading state before image loads */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400 text-xs">Loading...</span>
                </div>
              )}
              
              {/* Show the actual image */}
              <img 
                src={item.media[0].url} 
                alt={item.name} 
                className={`w-full h-full object-cover transition-opacity duration-200 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => {
                  console.log(`Image loaded successfully for ${item.name}:`, item.media[0].url);
                  setImageLoaded(true);
                  setImageError(false);
                }}
                onError={(e) => {
                  console.error(`Image error for ${item.name}:`, item.media[0].url);
                  setImageError(true);
                  
                  // Try loading a placeholder image instead
                  e.currentTarget.src = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300";
                  
                  // If the placeholder also fails, show the fallback UI
                  e.currentTarget.onerror = () => {
                    console.error(`Fallback image also failed for ${item.name}`);
                    setImageError(true);
                    setImageLoaded(false);
                  };
                }}
              />
              
              {/* Show error state if both original and fallback images fail */}
              {imageError && !imageLoaded && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                  <Image className="h-5 w-5 text-gray-400" />
                </div>
              )}
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
                        console.error(`Gallery image error for ${item.name} (${idx}):`, media.url);
                        e.currentTarget.src = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop";
                        e.currentTarget.onerror = null; // Prevent infinite error loops
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
