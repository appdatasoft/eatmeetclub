
import React, { useState } from 'react';
import { Volume, RefreshCcw, Film } from 'lucide-react';

interface MediaVideoProps {
  url: string;
  className?: string;
  onClick?: () => void;
  showControls?: boolean;
  autoPlay?: boolean;
}

const MediaVideo: React.FC<MediaVideoProps> = ({ 
  url, 
  className = "", 
  onClick,
  showControls = false,
  autoPlay = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  
  const handleVideoLoad = () => {
    console.log(`Video loaded successfully: ${url}`);
    setIsLoaded(true);
    setHasError(false);
  };
  
  const handleVideoError = () => {
    console.error(`Video error: ${url}`);
    setHasError(true);
    setIsLoaded(false);
  };
  
  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick if this is inside a clickable area
    
    if (retryCount < maxRetries) {
      console.log(`Retrying video load for ${url}, attempt ${retryCount + 1}`);
      setHasError(false);
      setIsLoaded(false);
      setRetryCount(prev => prev + 1);
      
      // Force browser to re-fetch the video by adding a timestamp parameter
      const videoElement = e.currentTarget.parentElement?.querySelector('video') as HTMLVideoElement;
      if (videoElement) {
        videoElement.src = url.includes('?') 
          ? `${url}&retry=${Date.now()}` 
          : `${url}?retry=${Date.now()}`;
        videoElement.load();
      }
    } else {
      console.error(`Maximum retry attempts (${maxRetries}) reached for ${url}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10" aria-hidden="true">
          <div className="text-xs text-gray-500 animate-pulse">Loading video...</div>
        </div>
      )}
      
      {/* Actual video */}
      <video 
        src={url}
        className={`w-full h-full object-cover ${className}`}
        controls={showControls}
        autoPlay={autoPlay}
        onClick={onClick}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        onKeyDown={onClick ? handleKeyDown : undefined}
        tabIndex={onClick ? 0 : -1}
        aria-label={showControls ? "Video player" : "Menu item video preview"}
        playsInline
        muted={!showControls}
        loop={!showControls}
      />
      
      {/* Overlay for non-controlled videos */}
      {!hasError && !showControls && isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          aria-hidden="true"
        >
          <Volume className="h-5 w-5 text-white" />
        </div>
      )}
      
      {/* Error state with retry button */}
      {hasError && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-20"
          aria-label="Video failed to load"
        >
          <Film className="h-6 w-6 text-gray-400 mb-2" aria-hidden="true" />
          <span className="text-sm text-gray-500 mb-2">Failed to load video</span>
          
          {retryCount < maxRetries && (
            <button 
              type="button"
              onClick={handleRetry}
              className="flex items-center text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded border shadow-sm transition-colors"
              aria-label="Retry loading the video"
            >
              <RefreshCcw className="h-3 w-3 mr-1" aria-hidden="true" /> 
              Retry
            </button>
          )}
          <span className="sr-only">Video could not be loaded</span>
        </div>
      )}
    </div>
  );
};

export default MediaVideo;
