
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { MenuItem } from "../types";
import { ImageOff, Film, ArrowLeft, ArrowRight } from "lucide-react";

interface MediaGalleryDialogProps {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MediaGalleryDialog: React.FC<MediaGalleryDialogProps> = ({ item, open, onOpenChange }) => {
  const hasMedia = item.media && item.media.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">{item.name}</DialogTitle>
        </DialogHeader>
        
        {hasMedia && (
          <div className="relative">
            <Carousel 
              className="w-full"
              onSelect={(index) => setActiveIndex(index)}
              defaultIndex={activeIndex}
            >
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
                              // Create error message element
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              
                              // Create error element
                              const container = target.parentElement;
                              if (container) {
                                // Create error message element
                                const errorDiv = document.createElement('div');
                                errorDiv.className = "flex flex-col items-center justify-center h-[40vh] w-full";
                                errorDiv.innerHTML = `
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-gray-400 mb-2">
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                                    <circle cx="9" cy="9" r="2"></circle>
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                                  </svg>
                                  <span class="text-gray-500">Image failed to load</span>
                                `;
                                container.appendChild(errorDiv);
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
                            target.style.display = 'none';
                            
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
                              container.appendChild(errorDiv);
                            }
                          }}
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {item.media && item.media.length > 1 && (
                <>
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex((prev) => (prev - 1 + item.media.length) % item.media.length);
                      }}
                      className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                      aria-label="Previous image"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex((prev) => (prev + 1) % item.media.length);
                      }}
                      className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                      aria-label="Next image"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </Carousel>
            
            {/* Image counter */}
            {item.media && item.media.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {activeIndex + 1} / {item.media.length}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MediaGalleryDialog;
