
import React, { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff, RefreshCcw } from 'lucide-react';
import { addCacheBuster } from '@/utils/supabaseStorage';

interface SupabaseImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: string | number;
  height?: string | number;
  onClick?: () => void;
  fallbackComponent?: React.ReactNode;
}

const SupabaseImage: React.FC<SupabaseImageProps> = ({
  src,
  alt,
  className = "",
  fallbackSrc = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
  width,
  height,
  onClick,
  fallbackComponent
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(addCacheBuster(src));
  const maxRetries = 3;

  // Reset states when src changes
  useEffect(() => {
    setCurrentSrc(addCacheBuster(src));
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    // Try with cache-busting parameter automatically if under max retries
    if (retryCount < maxRetries) {
      const nextCount = retryCount + 1;
      setRetryCount(nextCount);
      
      // Force browser to re-fetch the image by adding a timestamp parameter
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const newSrc = src.includes('?') 
        ? `${src}&t=${timestamp}&r=${randomString}&attempt=${nextCount}` 
        : `${src}?t=${timestamp}&r=${randomString}&attempt=${nextCount}`;
      
      console.log(`Auto-retrying image load (${nextCount}/${maxRetries}): ${newSrc}`);
      setCurrentSrc(newSrc);
    } else {
      setIsLoading(false);
      setHasError(true);
      console.error(`Failed to load image after ${maxRetries} attempts: ${src}`);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick if inside a clickable element
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
    
    // Force browser to retry by adding/changing timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const newSrc = src.includes('?') 
      ? `${src}&t=${timestamp}&r=${randomString}&manual=true` 
      : `${src}?t=${timestamp}&r=${randomString}&manual=true`;
    
    console.log(`Manual retry for image: ${newSrc}`);
    setCurrentSrc(newSrc);
  };

  // If custom fallback is provided and there's an error, show it
  if (hasError && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Loading skeleton */}
      {isLoading && (
        <Skeleton 
          className={`absolute inset-0 ${className}`} 
          style={{ width: '100%', height: '100%' }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div 
          className={`flex flex-col items-center justify-center bg-gray-100 rounded ${className}`} 
          style={{ width: '100%', height: '100%', minHeight: '100px' }}
        >
          <ImageOff className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-2">Failed to load image</p>
          <button 
            onClick={handleRetry}
            className="flex items-center bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 text-sm rounded border shadow-sm transition-colors"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </button>

          {/* Hidden fallback image that will show if visible image fails */}
          {fallbackSrc && (
            <img 
              src={fallbackSrc} 
              alt={alt} 
              className={`absolute inset-0 object-cover w-full h-full ${className}`} 
              style={{ opacity: 0.3 }}
            />
          )}
        </div>
      )}

      {/* Main image */}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} ${hasError ? 'hidden' : ''} transition-opacity duration-200`}
        style={{ 
          width: hasError ? '0' : '100%', 
          height: hasError ? '0' : '100%', 
          objectFit: 'cover' 
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onClick}
      />
    </div>
  );
};

export default SupabaseImage;
