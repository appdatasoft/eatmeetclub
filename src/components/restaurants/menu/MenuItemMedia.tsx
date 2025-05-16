
import React, { useState } from 'react';
import { MediaItem } from './MenuItemMediaUploader';
import { Image, Video, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MenuItemMediaProps {
  media?: MediaItem[];
  className?: string;
}

const MenuItemMedia: React.FC<MenuItemMediaProps> = ({ media, className = "" }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  if (!media || media.length === 0) return null;
  
  const handleMediaClick = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const handleCloseDialog = () => {
    setSelectedMedia(null);
  };
  
  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {media.map((item, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 relative cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleMediaClick(item)}
          >
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

      {/* Full-size Media Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white">
          <div className="relative">
            {selectedMedia?.type === 'image' && selectedMedia.url && (
              <img 
                src={selectedMedia.url} 
                alt="Menu item full view" 
                className="w-full max-h-[80vh] object-contain"
              />
            )}
            {selectedMedia?.type === 'video' && selectedMedia.url && (
              <video 
                src={selectedMedia.url}
                controls
                className="w-full max-h-[80vh] object-contain"
                autoPlay
              />
            )}
            <button 
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
              onClick={handleCloseDialog}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItemMedia;
