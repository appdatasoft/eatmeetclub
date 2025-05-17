
import React from "react";
import { X, ImageOff, RefreshCcw } from "lucide-react";
import { MediaItem } from "./types/mediaTypes";
import { addCacheBuster, getDefaultFoodPlaceholder } from "@/utils/supabaseStorage";

interface MediaPreviewProps {
  mediaItems: MediaItem[];
  onRemove: (index: number) => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ mediaItems, onRemove }) => {
  const [loadingStates, setLoadingStates] = React.useState<Record<number, boolean>>({});
  const [errorStates, setErrorStates] = React.useState<Record<number, boolean>>({});
  const [retryCount, setRetryCount] = React.useState<Record<number, number>>({});
  const [usedFallback, setUsedFallback] = React.useState<Record<number, boolean>>({});
  const maxRetries = 3;

  const handleImageLoad = (index: number) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
    setErrorStates(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    const currentRetries = retryCount[index] || 0;
    
    if (currentRetries < maxRetries) {
      // Auto-retry with increasing retry count
      setRetryCount(prev => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
      setLoadingStates(prev => ({ ...prev, [index]: true }));
      // The img element will automatically retry with the new src
    } else if (!usedFallback[index]) {
      // Try fallback image
      setUsedFallback(prev => ({ ...prev, [index]: true }));
      setRetryCount(prev => ({ ...prev, [index]: 0 }));
    } else {
      // All retries failed
      setLoadingStates(prev => ({ ...prev, [index]: false }));
      setErrorStates(prev => ({ ...prev, [index]: true }));
    }
  };

  const handleRetry = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering remove
    setLoadingStates(prev => ({ ...prev, [index]: true }));
    setErrorStates(prev => ({ ...prev, [index]: false }));
    setRetryCount(prev => ({ ...prev, [index]: 0 }));
    setUsedFallback(prev => ({ ...prev, [index]: false }));
  };

  // Construct image URL with cache busting based on retry state
  const getImageUrl = (item: MediaItem, index: number): string => {
    // First check if the URL is valid
    if (!item.url || item.url.trim() === '') {
      return getDefaultFoodPlaceholder();
    }
    
    try {
      // Test if URL is valid by constructing a URL object
      new URL(item.url);
      
      const currentRetryCount = retryCount[index] || 0;
      
      if (usedFallback[index]) {
        return getDefaultFoodPlaceholder();
      }
      
      let url = item.url;
      if (currentRetryCount > 0) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 7);
        url = url.includes('?') 
          ? `${url}&t=${timestamp}&r=${random}&retry=${currentRetryCount}` 
          : `${url}?t=${timestamp}&r=${random}&retry=${currentRetryCount}`;
      }
      
      return url;
    } catch (err) {
      console.error(`Invalid URL in MediaPreview: ${item.url}`, err);
      return getDefaultFoodPlaceholder();
    }
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
                src={getImageUrl(item, index)}
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
              {item.url && item.url.trim() !== '' ? (
                <video 
                  src={item.url} 
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-gray-400 text-xs">No video</span>
                </div>
              )}
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
