
import React from 'react';
import { Volume } from 'lucide-react';

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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="relative w-full h-full">
      <video 
        src={url}
        className={`w-full h-full object-cover ${className}`}
        controls={showControls}
        autoPlay={autoPlay}
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        tabIndex={onClick ? 0 : -1}
        aria-label="Menu item video"
        playsInline
        muted={!showControls}
        loop={!showControls}
      />
      {!showControls && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          aria-hidden="true"
        >
          <Volume className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default MediaVideo;
