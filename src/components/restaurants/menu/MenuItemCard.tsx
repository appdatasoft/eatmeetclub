
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { MediaItem } from './MenuItemMediaUploader';
import MenuItemMedia from './MenuItemMedia';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  ingredients: string[];
  media?: MediaItem[];
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onEdit, onDelete }) => {
  // Log the item to debug
  console.log("MenuItemCard rendering item:", item.name, "with media:", item.media);
  
  const hasMedia = !!(item.media && item.media.length > 0);
  
  return (
    <Card className="overflow-hidden bg-white hover:shadow-md transition-shadow border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Show thumbnail if available */}
          {hasMedia && (
            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
              <MenuItemMedia media={item.media} className="mt-0" thumbnailOnly />
            </div>
          )}
          
          {/* No image found fallback */}
          {!hasMedia && (
            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-gray-400">No image</span>
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
