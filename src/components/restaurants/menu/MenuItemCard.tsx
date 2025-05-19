import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Image, ArrowLeft, ArrowRight } from 'lucide-react';
import { MenuItem, MediaItem } from '@/types/menuItem';
import MenuItemMedia from './MenuItemMedia';
import MediaDialog from './media/MediaDialog';
import { MediaItem as UIMediaItem } from './types/mediaTypes';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onEdit, onDelete }) => {  
  const [selectedMedia, setSelectedMedia] = useState<UIMediaItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Log the item to debug
  console.log("MenuItemCard rendering item:", item.name, "with media:", item.media);
  
  const hasMedia = !!(item.media && item.media.length > 0);
  
  const handleMediaClick = () => {
    if (hasMedia && item.media) {
      const media = item.media[activeIndex];
      // Convert to format expected by MediaDialog
      const dialogMedia: UIMediaItem = {
        id: media.id,
        url: media.url,
        type: media.media_type === 'image' ? 'image' : 'video',
        media_type: media.media_type,
        menu_item_id: media.menu_item_id
      };
      setSelectedMedia(dialogMedia);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!hasMedia || !item.media || item.media.length <= 1) return;
    
    if (direction === 'next') {
      setActiveIndex((prev) => (prev + 1) % item.media.length);
    } else {
      setActiveIndex((prev) => (prev - 1 + item.media.length) % item.media.length);
    }
  };

  return (
    <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Show thumbnail if available */}
          {hasMedia && (
            <div className="flex-shrink-0">
              <div className="flex flex-col">
                <div 
                  className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={handleMediaClick}
                >
                  {item.media && item.media[activeIndex] && item.media[activeIndex].media_type === 'image' ? (
                    <img 
                      src={item.media[activeIndex].url} 
                      alt="Menu item thumbnail" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const container = target.parentElement;
                        if (container) {
                          const errorElement = document.createElement('div');
                          errorElement.className = 'flex items-center justify-center h-full w-full';
                          errorElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
                          container.appendChild(errorElement);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-800">
                      <span className="text-xs text-white">Video</span>
                    </div>
                  )}
                </div>

                {/* Show media count indicator if multiple media */}
                {hasMedia && item.media && item.media.length > 1 && (
                  <div className="text-[10px] text-gray-500 text-center mt-1">
                    {activeIndex + 1}/{item.media.length}
                  </div>
                )}

                {/* Navigation buttons below the thumbnail */}
                {hasMedia && item.media && item.media.length > 1 && (
                  <div className="flex justify-between gap-1 mt-1">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate('prev');
                      }}
                      className="flex-1 bg-gray-100 text-gray-600 rounded py-0.5 px-1 hover:bg-gray-200 transition-colors text-[10px] flex items-center justify-center"
                      aria-label="Previous image"
                    >
                      <ArrowLeft className="h-2.5 w-2.5 mr-0.5" />
                      <span>Prev</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate('next');
                      }}
                      className="flex-1 bg-gray-100 text-gray-600 rounded py-0.5 px-1 hover:bg-gray-200 transition-colors text-[10px] flex items-center justify-center"
                      aria-label="Next image"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Full-size Media Dialog */}
              <MediaDialog
                mediaItem={selectedMedia}
                onClose={() => setSelectedMedia(null)}
              />
            </div>
          )}
          
          {/* No image found fallback */}
          {!hasMedia && (
            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <Image className="h-5 w-5 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            )}
            
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
                <div className="flex flex-wrap gap-1">
                  {item.ingredients.map((ingredient, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0 flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(item)}
          className="h-8"
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(item.id)}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8"
        >
          <Trash className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MenuItemCard;
