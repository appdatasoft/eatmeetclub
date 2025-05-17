
import React, { useState } from 'react';
import { Image } from 'lucide-react';

interface MediaImageProps {
  url: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const MediaImage: React.FC<MediaImageProps> = ({ url, alt, className = "", onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleImageLoad = () => {
    console.log(`Image loaded successfully: ${url}`);
    setIsLoaded(true);
    setHasError(false);
  };
  
  const handleImageError = () => {
    console.error(`Image error: ${url}`);
    setHasError(true);
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
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-xs text-gray-500">Loading</span>
        </div>
      )}
      
      {/* Actual image */}
      <img 
        src={url} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        tabIndex={onClick ? 0 : -1}
        role={onClick ? "button" : undefined}
        aria-label={onClick ? `View ${alt}` : undefined}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center" aria-label="Image failed to load">
          <Image className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="sr-only">Image could not be loaded</span>
        </div>
      )}
    </div>
  );
};

export default MediaImage;
