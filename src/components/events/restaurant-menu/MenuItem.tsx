
import React, { useState, useEffect } from "react";
import { MenuItem } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Image, RefreshCcw, ImageOff, GalleryHorizontal } from "lucide-react";

interface MenuItemProps {
  item: MenuItem;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  const hasMedia = item.media && item.media.length > 0;
  const hasMultipleMedia = hasMedia && item.media.length > 1;
  
  // Reset image states when media changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setRetryCount(0);
  }, [item.media]);
  
  const handleRetryImage = () => {
    if (retryCount < maxRetries) {
      console.log(`Retrying image load for ${item.name}, attempt ${retryCount + 1}`);
      setImageError(false);
      setImageLoaded(false);
      setRetryCount(prevCount => prevCount + 1);
    }
  };
  
  // Get the first media item or null if none available
  const getPrimaryImage = () => {
    if (!hasMedia) return null;
    return item.media[0];
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
            role={hasMedia ? "button" : undefined}
            tabIndex={hasMedia ? 0 : -1}
            aria-label={hasMedia ? `View ${item.name} gallery` : `No images for ${item.name}`}
            onKeyDown={(e) => {
              if (hasMedia && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setShowGallery(true);
              }
            }}
          >
            {primaryImage ? (
              <>
                {/* Show loading state before image loads */}
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-xs animate-pulse">Loading...</span>
                  </div>
                )}
                
                {/* Show the actual image */}
                <img 
                  src={primaryImage.url} 
                  alt={`${item.name} thumbnail`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetryImage();
                    }}
                  >
                    <ImageOff className="h-4 w-4 text-gray-400 mb-1" aria-hidden="true" />
                    {retryCount < maxRetries ? (
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-xs">Tap to retry</span>
                        <RefreshCcw className="h-3 w-3 text-gray-400 mt-1" />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Failed to load</span>
                    )}
                  </div>
                )}
                
                {/* Show gallery indicator if there are multiple images */}
                {hasMultipleMedia && imageLoaded && (
                  <div 
                    className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-1 rounded-tl-md flex items-center"
                    aria-hidden="true"
                  >
                    <GalleryHorizontal className="h-3 w-3 mr-1" />
                    {item.media.length}
                  </div>
                )}
              </>
            ) : (
              // No media available
              <div className="flex items-center justify-center h-full w-full" aria-label="No image available">
                <Image className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span className="sr-only">No image available for {item.name}</span>
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
              aria-label={`View gallery of ${item.media.length} images for ${item.name}`}
            >
              <GalleryHorizontal className="h-3 w-3 mr-1" aria-hidden="true" />
              View gallery
            </button>
          )}
        </div>
      </div>
      
      {/* Image Gallery Dialog */}
      <Dialog 
        open={showGallery} 
        onOpenChange={setShowGallery}
      >
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
                        <div className="relative w-full">
                          <img 
                            src={media.url} 
                            alt={`${item.name} photo ${idx+1}`} 
                            className="max-h-[60vh] object-contain rounded-md mx-auto"
                            onError={(e) => {
                              console.error(`Gallery image error for ${item.name} (${idx}):`, media.url);
                              // Replace with error UI instead of a placeholder image
                              const target = e.currentTarget;
                              const container = target.parentElement;
                              if (container) {
                                // Create error message element
                                const errorDiv = document.createElement('div');
                                errorDiv.className = "flex flex-col items-center justify-center h-[40vh] w-full";
                                errorDiv.innerHTML = `
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-gray-400 mb-2">
                                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                    <circle cx="12" cy="13" r="3"></circle>
                                    <line x1="4.5" y1="19.5" x2="19.5" y2="4.5"></line>
                                  </svg>
                                  <span class="text-gray-500">Image failed to load</span>
                                `;
                                container.replaceChild(errorDiv, target);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <video 
                          src={media.url} 
                          controls
                          className="max-h-[60vh] object-contain rounded-md"
                          onError={(e) => {
                            console.error(`Gallery video error for ${item.name} (${idx}):`, media.url);
                            const target = e.currentTarget as HTMLVideoElement;
                            const container = target.parentElement;
                            if (container) {
                              // Create error message element
                              const errorDiv = document.createElement('div');
                              errorDiv.className = "flex flex-col items-center justify-center h-[40vh] w-full";
                              errorDiv.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-gray-400 mb-2">
                                  <path d="m22 8-6 4 6 4V8Z"></path>
                                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
                                  <line x1="2" y1="20" x2="22" y2="0"></line>
                                </svg>
                                <span class="text-gray-500">Video failed to load</span>
                              `;
                              container.replaceChild(errorDiv, target);
                            }
                          }}
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
