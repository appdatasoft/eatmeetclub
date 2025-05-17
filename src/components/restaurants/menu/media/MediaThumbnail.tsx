
import React from 'react';
import { Image, ArrowLeft, ArrowRight } from 'lucide-react';
import { MediaItem } from '../types/mediaTypes';
import MediaImage from './MediaImage';
import MediaVideo from './MediaVideo';

interface MediaThumbnailProps {
  item: MediaItem;
  onClick: () => void;
  className?: string;
  "data-index"?: number;
  totalItems?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
  showNav?: boolean;
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ 
  item, 
  onClick, 
  className = "",
  "data-index": dataIndex,
  totalItems = 0,
  onNavigate,
  showNav = false
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    } else if (showNav && onNavigate) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('next');
      }
    }
  };

  // Handle navigation clicks with preventing event bubbling
  const handleNavClick = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate(direction);
    }
  };

  // Validate URL existence before rendering
  const hasValidUrl = item && item.url && typeof item.url === 'string' && item.url.trim() !== '';

  return (
    <div 
      className={`w-16 h-16 rounded-md overflow-hidden bg-gray-100 cursor-pointer relative ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      data-index={dataIndex}
      aria-label={item.type === 'image' ? "View image" : "Play video"}
    >
      {hasValidUrl ? (
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

      {/* Navigation arrows - only show when there are multiple items */}
      {showNav && totalItems > 1 && (
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <button 
            type="button"
            onClick={(e) => handleNavClick('prev', e)}
            className="bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <ArrowLeft size={14} />
          </button>
          
          <button 
            type="button"
            onClick={(e) => handleNavClick('next', e)}
            className="bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaThumbnail;
