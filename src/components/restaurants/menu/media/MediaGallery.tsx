
import React from 'react';
import { GalleryHorizontal } from 'lucide-react';
import { MediaItem } from '../types/mediaTypes';
import MediaThumbnail from './MediaThumbnail';

interface MediaGalleryProps {
  media: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, onSelectMedia, className = "" }) => {
  return (
    <div className={`flex overflow-x-auto space-x-2 pb-2 ${className}`}>
      {media.map((item, index) => (
        <MediaThumbnail
          key={index}
          item={item}
          onClick={() => onSelectMedia(item)}
        />
      ))}
    </div>
  );
};

export default MediaGallery;
