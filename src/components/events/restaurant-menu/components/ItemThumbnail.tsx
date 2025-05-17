
import React, { useState } from "react";
import { MediaItem } from "../types";
import { GalleryHorizontal, ImageOff, Film, ArrowLeft, ArrowRight } from "lucide-react";

interface ItemThumbnailProps {
  media: MediaItem[];
  name: string;
  onClick: () => void;
}

const ItemThumbnail: React.FC<ItemThumbnailProps> = ({ media, name, onClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleMedia = media.length > 1;
  
  const handleNavigate = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    if (direction === 'next') {
      setActiveIndex((prev) => (prev + 1) % media.length);
    } else {
      setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
    }
  };
  
  // No media case
  if (!media || media.length === 0) {
    return (
      <div 
        className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center"
        onClick={onClick}
      >
        <ImageOff className="h-5 w-5 text-gray-400" />
      </div>
    );
  }
  
  // Get current media item
  const currentMedia = media[activeIndex];
  
  return (
    <div className="relative group" onClick={onClick}>
      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
        {currentMedia.type === 'image' ? (
          currentMedia.url ? (
            <img 
              src={currentMedia.url} 
              alt={`${name} thumbnail`}
              className="w-full h-full object-cover" 
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const container = target.parentElement;
                if (container) {
                  const errorElement = document.createElement('div');
                  errorElement.className = 'flex items-center justify-center h-full w-full';
                  errorElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
                  container.appendChild(errorElement);
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <ImageOff className="h-4 w-4 text-gray-400" />
            </div>
          )
        ) : (
          currentMedia.url ? (
            <div className="relative w-full h-full flex items-center justify-center bg-gray-800">
              <Film className="h-4 w-4 text-white" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <Film className="h-4 w-4 text-gray-400" />
            </div>
          )
        )}
      </div>
      
      {/* Media count indicator for multiple media */}
      {hasMultipleMedia && (
        <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 rounded-tl-md flex items-center">
          <GalleryHorizontal className="h-2 w-2 mr-0.5" aria-hidden="true" />
          <span>{media.length}</span>
        </div>
      )}
      
      {/* Navigation arrows - only show when there are multiple items and on hover/focus */}
      {hasMultipleMedia && (
        <div className="absolute inset-0 flex items-center justify-between px-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button 
            type="button"
            onClick={(e) => handleNavigate('prev', e)}
            className="bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
            aria-label="Previous image"
          >
            <ArrowLeft className="h-2 w-2" />
          </button>
          
          <button 
            type="button"
            onClick={(e) => handleNavigate('next', e)}
            className="bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors focus:outline-none focus:ring-1 focus:ring-white"
            aria-label="Next image"
          >
            <ArrowRight className="h-2 w-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemThumbnail;
