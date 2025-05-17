
import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { MediaItem } from '../types/mediaTypes';
import MediaImage from './MediaImage';
import MediaVideo from './MediaVideo';

interface MediaDialogProps {
  mediaItem: MediaItem | null;
  onClose: () => void;
}

const MediaDialog: React.FC<MediaDialogProps> = ({ mediaItem, onClose }) => {
  if (!mediaItem) return null;
  
  return (
    <Dialog open={!!mediaItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white border border-gray-200">
        <DialogDescription className="sr-only">
          Full view of menu item image or video
        </DialogDescription>
        <div className="relative">
          {mediaItem.type === 'image' && mediaItem.url && (
            <MediaImage 
              url={mediaItem.url} 
              alt="Menu item full view" 
              className="w-full max-h-[80vh] object-contain"
            />
          )}
          {mediaItem.type === 'video' && mediaItem.url && (
            <MediaVideo 
              url={mediaItem.url}
              showControls={true}
              autoPlay={true}
              className="w-full max-h-[80vh] object-contain"
            />
          )}
          <button 
            className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaDialog;
