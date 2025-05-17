
import React, { useState } from 'react';
import { MediaItem } from './types/mediaTypes';
import { GalleryHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
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
    setSelectedMedia(media[newIndex]);
  };
  
  // If thumbnailOnly is true, just show the first item as a thumbnail
  if (thumbnailOnly && media.length > 0) {
    return (
      <div className={`${className}`}>
        <div className="relative">
          <MediaThumbnail
            item={media[activeIndex]}
            onClick={() => handleMediaClick(media[activeIndex])}
            totalItems={media.length}
            onNavigate={handleNavigate}
            showNav={media.length > 1}
          />
          
          {/* Show gallery indicator if there are multiple items */}
          {media.length > 1 && (
            <div 
              className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-1 rounded-tl-md flex items-center"
              aria-label={`${media.length} media items available`}
            >
              <GalleryHorizontal className="h-3 w-3 mr-1" aria-hidden="true" />
              <span>{media.length}</span>
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
