
import React from 'react';
import { MediaItem } from './MenuItemMediaUploader';
import { Image, Video } from 'lucide-react';

interface MenuItemMediaProps {
  media?: MediaItem[];
  className?: string;
}

const MenuItemMedia: React.FC<MenuItemMediaProps> = ({ media, className = "" }) => {
  if (!media || media.length === 0) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {media.map((item, index) => (
          <div key={index} className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 relative">
            {item.url && item.type === 'image' ? (
              <img 
                src={item.url} 
                alt="Menu item" 
                className="w-full h-full object-cover"
              />
            ) : item.url && item.type === 'video' ? (
              <div className="relative w-full h-full">
                <video 
                  src={item.url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <Image className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItemMedia;
