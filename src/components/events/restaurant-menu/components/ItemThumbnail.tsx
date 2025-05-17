
import React, { useState, useEffect } from "react";
import { MediaItem } from "../types";
import { Image, RefreshCcw, ImageOff, GalleryHorizontal } from "lucide-react";

interface ItemThumbnailProps {
  media?: MediaItem[];
  itemName: string;
  onOpenGallery: () => void;
}

const ItemThumbnail: React.FC<ItemThumbnailProps> = ({ 
  media, 
  itemName, 
  onOpenGallery 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  const hasMedia = media && media.length > 0;
  const hasMultipleMedia = hasMedia && media.length > 1;
  const primaryImage = hasMedia ? media[0] : null;
  
  // Reset image states when media changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setRetryCount(0);
  }, [media]);
  
  const handleRetryImage = () => {
    if (retryCount < maxRetries) {
      console.log(`Retrying image load for ${itemName}, attempt ${retryCount + 1}`);
      setImageError(false);
      setImageLoaded(false);
      setRetryCount(prevCount => prevCount + 1);
    }
  };

  // Special handling for doro-wot item - directly use Supabase path
  const useDoroWotSpecificImage = itemName.toLowerCase().includes('doro') || 
                                  itemName.toLowerCase().includes('wot');
  
  return (
    <div 
      className="w-16 h-16 rounded-md overflow-hidden cursor-pointer relative bg-gray-100"
      onClick={() => hasMedia && onOpenGallery()}
      role={hasMedia ? "button" : undefined}
      tabIndex={hasMedia ? 0 : -1}
      aria-label={hasMedia ? `View ${itemName} gallery` : `No images for ${itemName}`}
      onKeyDown={(e) => {
        if (hasMedia && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpenGallery();
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
            alt={`${itemName} thumbnail`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => {
              console.log(`Image loaded successfully for ${itemName}:`, primaryImage.url);
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={(e) => {
              console.error(`Image error for ${itemName}:`, primaryImage.url);
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
              {media.length}
            </div>
          )}
        </>
      ) : (
        // No media available
        <div className="flex items-center justify-center h-full w-full" aria-label="No image available">
          <Image className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="sr-only">No image available for {itemName}</span>
        </div>
      )}
    </div>
  );
};

export default ItemThumbnail;
