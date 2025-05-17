
import React, { useState, useEffect } from 'react';
import { ImageOff, RefreshCcw } from 'lucide-react';

interface MediaImageProps {
  url: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const MediaImage: React.FC<MediaImageProps> = ({ url, alt, className = "", onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(url);
  const maxRetries = 3;
  
  // Reset states when URL changes
  useEffect(() => {
    setCurrentUrl(url);
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
  }, [url]);
  
  const handleImageLoad = () => {
    console.log(`Image loaded successfully: ${currentUrl}`);
    setIsLoaded(true);
    setHasError(false);
  };
  
  const handleImageError = () => {
    console.error(`Image error: ${currentUrl}`);
    setHasError(true);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick if this is inside a clickable area
    
    if (retryCount < maxRetries) {
      console.log(`Retrying image load for ${currentUrl}, attempt ${retryCount + 1}`);
      setHasError(false);
      setIsLoaded(false);
      setRetryCount(prev => prev + 1);
      
      // Force browser to re-fetch the image by adding a timestamp parameter
      const timestamp = Date.now();
      const newUrl = url.includes('?') 
        ? `${url}&cache=${timestamp}` 
        : `${url}?cache=${timestamp}`;
      
      setCurrentUrl(newUrl);
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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50" aria-hidden="true">
          <div className="text-xs text-gray-500 animate-pulse">Loading...</div>
        </div>
      )}
      
      {/* Actual image */}
      <img 
        src={currentUrl} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        tabIndex={onClick ? 0 : -1}
        role={onClick ? "button" : undefined}
        aria-label={onClick ? `View ${alt}` : undefined}
      />
      
      {/* Error state with retry button */}
      {hasError && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100"
          aria-label="Image failed to load"
        >
          <ImageOff className="h-6 w-6 text-gray-400 mb-2" aria-hidden="true" />
          <span className="text-sm text-gray-500 mb-2">Failed to load image</span>
          
          {retryCount < maxRetries && (
            <button 
              type="button"
              onClick={handleRetry}
              className="flex items-center text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded border shadow-sm transition-colors"
              aria-label="Retry loading the image"
            >
              <RefreshCcw className="h-3 w-3 mr-1" aria-hidden="true" /> 
              Retry
            </button>
          )}
          <span className="sr-only">Image could not be loaded</span>
        </div>
      )}
    </div>
  );
};

export default MediaImage;
