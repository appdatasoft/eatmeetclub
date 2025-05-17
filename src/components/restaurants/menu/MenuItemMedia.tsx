
import React, { useState } from 'react';
import { MediaItem } from './MenuItemMediaUploader';
import { Image, Video, X, GalleryHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';

interface MenuItemMediaProps {
  media?: MediaItem[];
  className?: string;
  thumbnailOnly?: boolean;
}

const MenuItemMedia: React.FC<MenuItemMediaProps> = ({ media, className = "", thumbnailOnly = false }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  if (!media || media.length === 0) return null;
  
  const handleMediaClick = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const handleCloseDialog = () => {
    setSelectedMedia(null);
  };
  
  // If thumbnailOnly is true, just show the first item as a thumbnail
  if (thumbnailOnly && media.length > 0) {
    return (
      <div className={`${className}`}>
        <div 
          className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 cursor-pointer relative"
          onClick={() => handleMediaClick(media[0])}
        >
          {media[0].url && media[0].type === 'image' ? (
            <img 
              src={media[0].url} 
              alt="Menu item thumbnail" 
              className="w-full h-full object-cover"
            />
          ) : media[0].url && media[0].type === 'video' ? (
            <div className="relative w-full h-full">
              <video 
                src={media[0].url}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Video className="h-5 w-5 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-gray-100">
              <Image className="h-6 w-6 text-gray-400" />
            </div>
          )}
          
          {/* Show gallery indicator if there are multiple items */}
          {media.length > 1 && (
            <div className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-1 rounded-tl-md flex items-center">
              <GalleryHorizontal className="h-3 w-3 mr-1" />
              {media.length}
            </div>
          )}
        </div>

        {/* Full-size Media Dialog */}
        <Dialog open={!!selectedMedia} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white border border-gray-200">
            <DialogDescription className="sr-only">
              Full view of menu item image or video
            </DialogDescription>
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
                className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100"
                onClick={handleCloseDialog}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  // Regular gallery view for multiple media items
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Video className="h-6 w-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-100">
                <Image className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full-size Media Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white border border-gray-200">
          <DialogDescription className="sr-only">
            Full view of menu item image or video
          </DialogDescription>
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
              className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100"
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
