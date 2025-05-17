
import React from "react";
import { X } from "lucide-react";
import { MediaItem } from "./types/mediaTypes";

interface MediaPreviewProps {
  mediaItems: MediaItem[];
  onRemove: (index: number) => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ mediaItems, onRemove }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {mediaItems.map((item, index) => (
        <div key={index} className="relative group">
          {item.type === 'image' ? (
            <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-100">
              <img 
                src={item.url} 
                alt="Menu item" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Image failed to load: ${item.url}`);
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <video 
                src={item.url} 
                className="w-full h-full object-cover"
                controls
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default MediaPreview;
