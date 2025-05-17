
import React, { useState, useEffect } from "react";
import { MenuItem } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Image, ImageOff, GalleryHorizontal } from "lucide-react";

interface MenuItemProps {
  item: MenuItem;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const hasMedia = item.media && item.media.length > 0;
  const hasMultipleMedia = hasMedia && item.media.length > 1;
  
  const restaurantId = item.restaurant_id || '';

  // Reset image states when media changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setRetryCount(0);
  }, [item.media]);
  
  const handleRetryImage = () => {
    if (retryCount < 2) {
      console.log(`Retrying image load for ${item.name}, attempt ${retryCount + 1}`);
      setImageError(false);
      setImageLoaded(false);
      setRetryCount(prevCount => prevCount + 1);
    }
  };
  
  // Validate URLs to avoid placeholders
  const isPlaceholderUrl = (url: string) => {
    return url.includes('unsplash.com') || !url.includes('supabase');
  };
  
  // Get the first non-placeholder image or use the first image as fallback
  const getPrimaryImage = () => {
    if (!hasMedia) return null;
    
    // Try to find a non-placeholder image first
    const nonPlaceholder = item.media.find(m => !isPlaceholderUrl(m.url));
    return nonPlaceholder || item.media[0];
  };
  
  const primaryImage = getPrimaryImage();
  
  return (
    <div className="border-b pb-3">
      <div className="flex">
        {/* Thumbnail - always show at least a placeholder */}
        <div className="mr-3">
          <div 
            className="w-16 h-16 rounded-md overflow-hidden cursor-pointer relative bg-gray-100"
            onClick={() => hasMedia && setShowGallery(true)}
          >
            {primaryImage ? (
              <>
                {/* Show loading state before image loads */}
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Loading...</span>
                  </div>
                )}
                
                {/* Show the actual image */}
                <img 
                  src={primaryImage.url} 
                  alt={item.name} 
                  className={`w-full h-full object-cover transition-opacity duration-200 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => {
                    console.log(`Image loaded successfully for ${item.name}:`, primaryImage.url);
                    setImageLoaded(true);
                    setImageError(false);
                  }}
                  onError={(e) => {
                    console.error(`Image error for ${item.name}:`, primaryImage.url);
                    setImageError(true);
                    setImageLoaded(false);
                  }}
                />
                
                {/* Show error state if image fails to load */}
                {imageError && !imageLoaded && (
                  <div 
                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 cursor-pointer"
                    onClick={handleRetryImage}
                  >
                    <ImageOff className="h-5 w-5 text-gray-400 mb-1" />
                    <span className="text-gray-400 text-xs">Tap to retry</span>
                  </div>
                )}
                
                {/* Show gallery indicator if there are multiple images */}
                {hasMultipleMedia && imageLoaded && (
                  <div className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-1 rounded-tl-md flex items-center">
                    <GalleryHorizontal className="h-3 w-3 mr-1" />
                    {item.media.length}
                  </div>
                )}
              </>
            ) : (
              // No media available
              <div className="flex items-center justify-center h-full w-full">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>
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
          
          {/* Show "View Gallery" if there are multiple images */}
          {hasMultipleMedia && (
            <button 
              className="text-xs text-primary mt-1 hover:underline flex items-center"
              onClick={() => setShowGallery(true)}
            >
              <GalleryHorizontal className="h-3 w-3 mr-1" />
              View gallery
            </button>
          )}
        </div>
      </div>
      
      {/* Image Gallery Dialog */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">{item.name}</DialogTitle>
          </DialogHeader>
          
          {hasMedia && (
            <Carousel className="w-full">
              <CarouselContent>
                {item.media.map((media, idx) => (
                  <CarouselItem key={idx}>
                    <div className="flex items-center justify-center p-1">
                      {media.type === 'image' ? (
                        <img 
                          src={media.url} 
                          alt={`${item.name} photo ${idx+1}`} 
                          className="max-h-[60vh] object-contain rounded-md"
                          onError={(e) => {
                            console.error(`Gallery image error for ${item.name} (${idx}):`, media.url);
                            e.currentTarget.onerror = null; // Prevent infinite error loops
                          }}
                        />
                      ) : (
                        <video 
                          src={media.url} 
                          controls
                          className="max-h-[60vh] object-contain rounded-md"
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItemComponent;
