
import React, { useState } from "react";
import { MediaItem } from "../types";
import { ImageOff, Film, ArrowLeft, ArrowRight } from "lucide-react";

interface ItemThumbnailProps {
  media: MediaItem[];
  name: string;
  onClick: () => void;
}

const ItemThumbnail: React.FC<ItemThumbnailProps> = ({ media, name, onClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleMedia = media.length > 1;
  
  // Get current media item
  const currentMedia = media[activeIndex];
  
  // Handle navigation without opening the popup
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
      >
        <ImageOff className="h-5 w-5 text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      {/* Thumbnail - only trigger popup when directly clicked */}
      <div 
        className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
        onClick={onClick}
      >
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
        <div className="text-[10px] text-gray-500 text-center mt-1 mb-1">
          {activeIndex + 1}/{media.length}
        </div>
      )}
      
      {/* Navigation arrows below the thumbnail with text labels */}
      {hasMultipleMedia && (
        <div className="flex justify-between gap-1 mt-1 text-xs">
          <button 
            type="button"
            onClick={(e) => handleNavigate('prev', e)}
            className="flex-1 bg-gray-100 text-gray-600 rounded py-0.5 px-1 hover:bg-gray-200 transition-colors text-[10px] flex items-center justify-center"
            aria-label="Previous image"
          >
            <ArrowLeft className="h-2.5 w-2.5 mr-0.5" />
            <span>Prev</span>
          </button>
          
          <button 
            type="button"
            onClick={(e) => handleNavigate('next', e)}
            className="flex-1 bg-gray-100 text-gray-600 rounded py-0.5 px-1 hover:bg-gray-200 transition-colors text-[10px] flex items-center justify-center"
            aria-label="Next image"
          >
            <span>Next</span>
            <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemThumbnail;
