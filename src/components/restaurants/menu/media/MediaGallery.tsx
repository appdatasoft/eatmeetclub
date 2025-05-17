
import React, { useRef, useEffect, useState } from 'react';
import { MediaItem } from '../types/mediaTypes';
import MediaThumbnail from './MediaThumbnail';

interface MediaGalleryProps {
  media: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, onSelectMedia, className = "" }) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    const currentIndex = Number((document.activeElement?.getAttribute('data-index') || '0'));
    
    if (e.key === 'ArrowRight' && currentIndex < media.length - 1) {
      const nextElement = galleryRef.current?.querySelector(`[data-index="${currentIndex + 1}"]`) as HTMLElement;
      nextElement?.focus();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      const prevElement = galleryRef.current?.querySelector(`[data-index="${currentIndex - 1}"]`) as HTMLElement;
      prevElement?.focus();
    }
  };

  // Navigation handler for the thumbnail navigator
  const handleNavigate = (index: number, direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'next') {
      newIndex = (index + 1) % media.length;
    } else {
      newIndex = (index - 1 + media.length) % media.length;
    }
    
    // Focus and scroll to the new thumbnail
    const nextElement = galleryRef.current?.querySelector(`[data-index="${newIndex}"]`) as HTMLElement;
    if (nextElement) {
      nextElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      nextElement.focus();
      setActiveIndex(newIndex);
    }
  };

  // Add keyboard navigation to gallery
  useEffect(() => {
    const gallery = galleryRef.current;
    if (gallery) {
      gallery.addEventListener('keydown', handleKeyNavigation as unknown as EventListener);
      return () => {
        gallery.removeEventListener('keydown', handleKeyNavigation as unknown as EventListener);
      };
    }
  }, [media.length]);

  return (
    <div 
      className={`flex overflow-x-auto space-x-2 pb-2 ${className}`}
      ref={galleryRef}
      role="list"
      aria-label="Media gallery"
    >
      {media.map((item, index) => (
        <div key={index} role="listitem">
          <MediaThumbnail
            item={item}
            onClick={() => onSelectMedia(item)}
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            data-index={index}
            totalItems={media.length}
            onNavigate={(direction) => handleNavigate(index, direction)}
            showNav={media.length > 1}
          />
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
