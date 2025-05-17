
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
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  if (!media || media.length === 0) return null;
  
  const handleMediaClick = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const handleCloseDialog = () => {
    setSelectedMedia(null);
  };
  
  const handleImageLoad = (url: string) => {
    console.log(`Image loaded successfully: ${url}`);
    setImageLoaded(prev => ({ ...prev, [url]: true }));
    setImageError(prev => ({ ...prev, [url]: false }));
  };
  
  const handleImageError = (url: string) => {
    console.error(`Image error: ${url}`);
    setImageError(prev => ({ ...prev, [url]: true }));
  };
  
  // If thumbnailOnly is true, just show the first item as a thumbnail
  if (thumbnailOnly && media.length > 0) {
    const item = media[0];
    const isLoaded = imageLoaded[item.url];
    const hasError = imageError[item.url];
    
    return (
      <div className={`${className}`}>
        <div 
          className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 cursor-pointer relative"
          onClick={() => handleMediaClick(media[0])}
        >
          {item.url && item.type === 'image' ? (
            <>
              {/* Loading state */}
              {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Loading</span>
                </div>
              )}
              
              {/* Actual image */}
              <img 
                src={item.url} 
                alt="Menu item thumbnail" 
                className={`w-full h-full object-cover transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad(item.url)}
                onError={() => handleImageError(item.url)}
              />
              
              {/* Error state */}
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </>
          ) : item.url && item.type === 'video' ? (
            <div className="relative w-full h-full">
              <video 
                src={item.url}
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
        {media.map((item, index) => {
          const isLoaded = imageLoaded[item.url];
          const hasError = imageError[item.url];
          
          return (
            <div 
              key={index} 
              className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleMediaClick(item)}
            >
              {item.url && item.type === 'image' ? (
                <>
                  {/* Loading state */}
                  {!isLoaded && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-gray-500">Loading</span>
                    </div>
                  )}
                  
                  {/* Actual image */}
                  <img 
                    src={item.url} 
                    alt="Menu item" 
                    className={`w-full h-full object-cover transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(item.url)}
                    onError={() => handleImageError(item.url)}
                  />
                  
                  {/* Error state */}
                  {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </>
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
          );
        })}
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
