
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { MenuItem } from "../types";

interface MediaGalleryDialogProps {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MediaGalleryDialog: React.FC<MediaGalleryDialogProps> = ({ item, open, onOpenChange }) => {
  const hasMedia = item.media && item.media.length > 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">{item.name}</DialogTitle>
        </DialogHeader>
        
        {hasMedia && (
          <Carousel className="w-full">
            <CarouselContent>
              {item.media.map((media, idx) => (
                <CarouselItem key={idx}>
                  <div className="flex items-center justify-center p-1">
                    {media.type === 'image' ? (
                      <div className="relative w-full">
                        <img 
                          src={media.url} 
                          alt={`${item.name} photo ${idx+1}`} 
                          className="max-h-[60vh] object-contain rounded-md mx-auto"
                          onError={(e) => {
                            console.error(`Gallery image error for ${item.name} (${idx}):`, media.url);
                            // Replace with error UI instead of a placeholder image
                            const target = e.currentTarget;
                            const container = target.parentElement;
                            if (container) {
                              // Create error message element
                              const errorDiv = document.createElement('div');
                              errorDiv.className = "flex flex-col items-center justify-center h-[40vh] w-full";
                              errorDiv.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-gray-400 mb-2">
                                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                  <circle cx="12" cy="13" r="3"></circle>
                                  <line x1="4.5" y1="19.5" x2="19.5" y2="4.5"></line>
                                </svg>
                                <span class="text-gray-500">Image failed to load</span>
                              `;
                              container.replaceChild(errorDiv, target);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <video 
                        src={media.url} 
                        controls
                        className="max-h-[60vh] object-contain rounded-md"
                        onError={(e) => {
                          console.error(`Gallery video error for ${item.name} (${idx}):`, media.url);
                          const target = e.currentTarget as HTMLVideoElement;
                          const container = target.parentElement;
                          if (container) {
                            // Create error message element
                            const errorDiv = document.createElement('div');
                            errorDiv.className = "flex flex-col items-center justify-center h-[40vh] w-full";
                            errorDiv.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-gray-400 mb-2">
                                <path d="m22 8-6 4 6 4V8Z"></path>
                                <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
                                <line x1="2" y1="20" x2="22" y2="0"></line>
                              </svg>
                              <span class="text-gray-500">Video failed to load</span>
                            `;
                            container.replaceChild(errorDiv, target);
                          }
                        }}
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MediaGalleryDialog;
