
import React, { useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  type: string;
}

interface MenuItemMediaProps {
  media?: MediaItem[];
  thumbnailOnly?: boolean;
}

export const MenuItemMedia: React.FC<MenuItemMediaProps> = ({ media, thumbnailOnly = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  // Render only the thumbnail if thumbnailOnly is true
  if (thumbnailOnly) {
    return (
      <div className="aspect-square relative overflow-hidden rounded-lg">
        <img
          src={media[0].url}
          alt="Menu item thumbnail"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Render the gallery
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <img
        src={media[currentIndex].url}
        alt={`Menu item image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {media.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            onClick={handleNext}
            aria-label="Next image"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="bg-black/50 px-2 py-1 rounded-full text-xs text-white">
              {currentIndex + 1} / {media.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MenuItemMedia;
