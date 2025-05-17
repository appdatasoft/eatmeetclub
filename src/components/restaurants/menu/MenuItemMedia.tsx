
import React, { useState } from 'react';
import { MediaItem } from './types/mediaTypes';
import { GalleryHorizontal, ArrowLeft, ArrowRight, Film } from 'lucide-react';
import MediaThumbnail from './media/MediaThumbnail';
import MediaGallery from './media/MediaGallery';
import MediaDialog from './media/MediaDialog';

interface MenuItemMediaProps {
  media?: MediaItem[];
  className?: string;
  thumbnailOnly?: boolean;
}

const MenuItemMedia: React.FC<MenuItemMediaProps> = ({ media, className = "", thumbnailOnly = false }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!media || media.length === 0) return null;
  
  const handleMediaClick = (item: MediaItem) => {
    setSelectedMedia(item);
    // Find the index of the clicked item
    const index = media.findIndex(m => m.url === item.url && m.type === item.type);
    if (index !== -1) {
      setActiveIndex(index);
    }
  };

  const handleCloseDialog = () => {
    setSelectedMedia(null);
  };
  
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!media || media.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (activeIndex + 1) % media.length;
    } else {
      newIndex = (activeIndex - 1 + media.length) % media.length;
    }
    
    setActiveIndex(newIndex);
  };
  
  // If thumbnailOnly is true, just show the first item as a thumbnail
  if (thumbnailOnly && media.length > 0) {
    return (
      <div className={`${className}`}>
        {/* Thumbnail */}
        <div className="flex flex-col">
          <div 
            className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => handleMediaClick(media[activeIndex])}
          >
            {media[activeIndex].type === 'image' ? (
              <img 
                src={media[activeIndex].url} 
                alt="Menu item thumbnail" 
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
              <div className="flex items-center justify-center h-full w-full bg-gray-800">
                <Film className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          {/* Show media count indicator if multiple media */}
          {media.length > 1 && (
            <div className="text-[10px] text-gray-500 text-center mt-1">
              {activeIndex + 1}/{media.length}
            </div>
          )}
          
          {/* Navigation buttons below the thumbnail */}
          {media.length > 1 && (
            <div className="flex justify-between gap-1 mt-1">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate('prev');
                }}
                className="flex-1 bg-gray-100 text-gray-600 rounded py-0.5 px-1 hover:bg-gray-200 transition-colors text-[10px] flex items-center justify-center"
                aria-label="Previous image"
              >
                <ArrowLeft className="h-2.5 w-2.5 mr-0.5" />
                <span>Prev</span>
              </button>
              
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate('next');
                }}
                className="flex-1 bg-gray-100 text-gray-600 rounded py-0.5 px-1 hover:bg-gray-200 transition-colors text-[10px] flex items-center justify-center"
                aria-label="Next image"
              >
                <span>Next</span>
                <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Full-size Media Dialog */}
        <MediaDialog
          mediaItem={selectedMedia}
          onClose={handleCloseDialog}
        />
      </div>
    );
  }
  
  // Regular gallery view for multiple media items
  return (
    <div 
      className={`mt-2 ${className}`}
      aria-label="Menu item media gallery"
    >
      <MediaGallery
        media={media}
        onSelectMedia={handleMediaClick}
      />

      {/* Full-size Media Dialog */}
      <MediaDialog
        mediaItem={selectedMedia}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default MenuItemMedia;
