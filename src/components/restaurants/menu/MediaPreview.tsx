
import React from "react";
import { X, ImageOff, RefreshCcw } from "lucide-react";
import { MediaItem } from "./types/mediaTypes";
import { addCacheBuster } from "@/utils/supabaseStorage";

interface MediaPreviewProps {
  mediaItems: MediaItem[];
  onRemove: (index: number) => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ mediaItems, onRemove }) => {
  const [loadingStates, setLoadingStates] = React.useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = React.useState<Record<number, boolean>>({});

  const handleImageLoad = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
    setErrorStates(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
    setErrorStates(prev => ({ ...prev, [index]: true }));
  };

  const handleRetry = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering remove
    setLoadingStates(prev => ({ ...prev, [index]: true }));
    setErrorStates(prev => ({ ...prev, [index]: false }));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {mediaItems.map((item, index) => (
        <div key={index} className="relative group">
          {item.type === 'image' ? (
            <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-100 relative">
              {/* Error state */}
              {errorStates[index] && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                  <ImageOff className="h-5 w-5 text-gray-400 mb-1" />
                  <button
                    type="button"
                    onClick={(e) => handleRetry(index, e)}
                    className="flex items-center text-xxs bg-white hover:bg-gray-50 text-gray-700 px-2 py-0.5 rounded border shadow-sm"
                  >
                    <RefreshCcw className="h-2.5 w-2.5 mr-0.5" />
                    Retry
                  </button>
                </div>
              )}
              
              {/* Loading state */}
              {loadingStates[index] && !errorStates[index] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="text-xs text-gray-500 animate-pulse">Loading...</div>
                </div>
              )}
              
              {/* Actual image */}
              <img 
                src={addCacheBuster(item.url)}
                alt="Menu item" 
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                style={{
                  opacity: errorStates[index] ? 0 : 1
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <video 
                src={item.url} 
                className="w-full h-full object-cover"
                controls
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove media item"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default MediaPreview;
