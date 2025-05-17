
import React from 'react';
import { Video } from 'lucide-react';

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
  return (
    <div className="relative w-full h-full">
      <video 
        src={url}
        className={`w-full h-full object-cover ${className}`}
        controls={showControls}
        autoPlay={autoPlay}
        onClick={onClick}
      />
      {!showControls && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Video className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default MediaVideo;
