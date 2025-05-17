
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
  
  return (
    <>
      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-gray-500">Loading</span>
        </div>
      )}
      
      {/* Actual image */}
      <img 
        src={url} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onClick}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Image className="h-5 w-5 text-gray-400" />
        </div>
      )}
    </>
  );
};

export default MediaImage;
