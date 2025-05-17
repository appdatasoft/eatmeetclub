
import React from 'react';
import { Image } from 'lucide-react';
import { MediaItem } from '../types/mediaTypes';
import MediaImage from './MediaImage';
import MediaVideo from './MediaVideo';

interface MediaThumbnailProps {
  item: MediaItem;
  onClick: () => void;
  className?: string;
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ item, onClick, className = "" }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`w-16 h-16 rounded-md overflow-hidden bg-gray-100 cursor-pointer relative ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={item.type === 'image' ? "View image" : "Play video"}
    >
      {item.url ? (
        item.type === 'image' ? (
          <MediaImage 
            url={item.url} 
            alt="Menu item thumbnail" 
          />
        ) : (
          <MediaVideo 
            url={item.url}
          />
        )
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-gray-100" aria-hidden="true">
          <Image className="h-6 w-6 text-gray-400" />
          <span className="sr-only">No media available</span>
        </div>
      )}
    </div>
  );
};

export default MediaThumbnail;
