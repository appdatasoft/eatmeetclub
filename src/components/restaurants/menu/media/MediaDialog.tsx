
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { MediaItem as UIMediaItem } from '../types/mediaTypes';

interface MediaDialogProps {
  mediaItem: UIMediaItem | null;
  onClose: () => void;
}

const MediaDialog: React.FC<MediaDialogProps> = ({ mediaItem, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Focus trap
  useEffect(() => {
    if (mediaItem) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [mediaItem]);
  
  if (!mediaItem) return null;
  
  // Determine a descriptive title based on the media type
  const dialogTitle = mediaItem.type === 'image' ? 'Image Preview' : 'Video Preview';
  
  return (
    <Dialog open={!!mediaItem} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white border border-gray-200"
        aria-labelledby="media-dialog-title"
      >
        <h2 id="media-dialog-title" className="sr-only">{dialogTitle}</h2>
        <DialogDescription className="sr-only">
          {mediaItem.type === 'image' ? 
            'Full view of menu item image. Press Escape key to close.' : 
            'Full view of menu item video. Press Escape key to close.'}
        </DialogDescription>
        <div className="relative">
          {mediaItem.type === 'image' && mediaItem.url && (
            <img 
              src={mediaItem.url} 
              alt="Menu item full view" 
              className="w-full max-h-[80vh] object-contain"
            />
          )}
          {mediaItem.type === 'video' && mediaItem.url && (
            <video 
              src={mediaItem.url}
              controls
              autoPlay
              className="w-full max-h-[80vh] object-contain"
            />
          )}
          <button 
            ref={closeButtonRef}
            className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaDialog;
