
import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, RefreshCcw } from 'lucide-react';
import { addCacheBuster, getDefaultFoodPlaceholder } from '@/utils/supabaseStorage';

interface MediaImageProps {
  url: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  fallbackImg?: string;
}

const MediaImage: React.FC<MediaImageProps> = ({ 
  url, 
  alt, 
  className = "", 
  onClick,
  fallbackImg
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);
  const maxRetries = 3;
  const mountedRef = useRef(true);
  
  // Reset states when URL changes and generate cache-busted URL immediately
  useEffect(() => {
    const bustedUrl = addCacheBuster(url);
    setCurrentUrl(bustedUrl);
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
    setUsedFallback(false);
    
    return () => {
      mountedRef.current = false;
    };
  }, [url]);
  
  const handleImageLoad = () => {
    if (!mountedRef.current) return;
    console.log(`Image loaded successfully: ${currentUrl}`);
    setIsLoaded(true);
    setHasError(false);
  };
  
  const handleImageError = () => {
    if (!mountedRef.current) return;
    
    // Try with cache-busting parameter automatically if under max retries
    if (retryCount < maxRetries) {
      const nextRetryCount = retryCount + 1;
      setRetryCount(nextRetryCount);
      
      // Generate a completely new URL with timestamp to force browser to re-fetch
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const newUrl = url.includes('?') 
        ? `${url}&t=${timestamp}&r=${randomString}&retry=${nextRetryCount}` 
        : `${url}?t=${timestamp}&r=${randomString}&retry=${nextRetryCount}`;
      
      console.log(`Auto-retrying image load (${nextRetryCount}/${maxRetries}): ${newUrl}`);
      setCurrentUrl(newUrl);
    } else {
      // If we have a fallback image and haven't tried it yet, use it
      if (fallbackImg && !usedFallback) {
        console.log(`Trying fallback image: ${fallbackImg}`);
        setCurrentUrl(addCacheBuster(fallbackImg));
        setRetryCount(0);
        setUsedFallback(true);
      } else if (!usedFallback) {
        // Try default food placeholder as a last resort
        const placeholder = getDefaultFoodPlaceholder();
        console.log(`Using default food placeholder: ${placeholder}`);
        setCurrentUrl(addCacheBuster(placeholder));
        setRetryCount(0);
        setUsedFallback(true);
      } else {
        setHasError(true);
        console.error(`Maximum retry attempts (${maxRetries}) reached for ${url}`);
      }
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick if this is inside a clickable area
    
    setHasError(false);
    setIsLoaded(false);
    setRetryCount(0);
    setUsedFallback(false);
      
    // Force browser to re-fetch the image with a fresh timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7);
    const newUrl = url.includes('?') 
      ? `${url}&t=${timestamp}&r=${random}&manual=true` 
      : `${url}?t=${timestamp}&r=${random}&manual=true`;
    
    console.log(`Manual retry for image: ${newUrl}`);
    setCurrentUrl(newUrl);
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
          
          <button 
            type="button"
            onClick={handleRetry}
            className="flex items-center text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded border shadow-sm transition-colors"
            aria-label="Retry loading the image"
          >
            <RefreshCcw className="h-3 w-3 mr-1" aria-hidden="true" /> 
            Retry
          </button>
          <span className="sr-only">Image could not be loaded</span>
        </div>
      )}
    </div>
  );
};

export default MediaImage;
