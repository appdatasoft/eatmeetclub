
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MediaItem } from "@/components/restaurants/menu/MenuItemMediaUploader";
import MenuItemMedia from "@/components/restaurants/menu/MenuItemMedia";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  ingredients?: string[];
  media?: MediaItem[];
}

interface RestaurantMenuPreviewProps {
  restaurantId: string;
}

const RestaurantMenuPreview: React.FC<RestaurantMenuPreviewProps> = ({ restaurantId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuTypes, setMenuTypes] = useState<string[]>([]);
  const { toast } = useToast();

  // For debugging - log the restaurantId
  console.log("RestaurantMenuPreview - restaurantId:", restaurantId);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        console.log("No restaurantId provided to RestaurantMenuPreview");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch menu items
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);

        if (menuItemsError) {
          console.error("Error fetching menu items:", menuItemsError);
          throw menuItemsError;
        }
        
        if (!menuItemsData || menuItemsData.length === 0) {
          console.log("No menu items found for restaurant:", restaurantId);
          setMenuItems([]);
          setIsLoading(false);
          return;
        }

        console.log("Found menu items:", menuItemsData.length);

        // Process each menu item to fetch related data
        const itemsWithDetails = await Promise.all(menuItemsData.map(async (item) => {
          // Fetch ingredients
          const { data: ingredientsData, error: ingredientsError } = await supabase
            .from('restaurant_menu_ingredients')
            .select('name')
            .eq('menu_item_id', item.id);
            
          if (ingredientsError) {
            console.error("Error fetching ingredients:", ingredientsError);
          }
          
          // Try to get media directly from storage
          let media: MediaItem[] = [];
          try {
            // First try folder path with restaurant ID and item ID
            const folderPath = `menu-items/${restaurantId}/${item.id}`;
            console.log("Checking storage path:", folderPath);
            
            const { data: storageData, error: storageError } = await supabase
              .storage
              .from('lovable-uploads')
              .list(folderPath);
              
            if (storageError) {
              console.error("Error listing files:", storageError);
            }
              
            if (storageData && storageData.length > 0) {
              console.log("Found files in storage:", storageData.length);
              media = storageData.map(file => {
                const publicUrl = supabase.storage
                  .from('lovable-uploads')
                  .getPublicUrl(`${folderPath}/${file.name}`).data.publicUrl;
                  
                return {
                  url: publicUrl,
                  type: file.metadata?.mimetype?.startsWith('video/') ? 'video' : 'image'
                };
              });
            } else {
              // Try alternate path format
              const altPath = `menu-items/${item.id}-`;
              console.log("Checking alternate storage path:", altPath);
              
              const { data: altData, error: altError } = await supabase
                .storage
                .from('lovable-uploads')
                .list('menu-items', {
                  prefix: `${item.id}-`
                });
                
              if (altError) {
                console.error("Error listing alternate files:", altError);
              }
                
              if (altData && altData.length > 0) {
                console.log("Found files in alternate storage:", altData.length);
                media = altData.map(file => {
                  const publicUrl = supabase.storage
                    .from('lovable-uploads')
                    .getPublicUrl(`menu-items/${file.name}`).data.publicUrl;
                    
                  return {
                    url: publicUrl,
                    type: file.metadata?.mimetype?.startsWith('video/') ? 'video' : 'image'
                  };
                });
              }
            }
          } catch (storageErr) {
            console.error('Error accessing storage:', storageErr);
          }
          
          console.log(`Menu item ${item.id} has ${media.length} media items`);
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            type: '', // This doesn't exist in the database schema
            ingredients: ingredientsData ? ingredientsData.map(ing => ing.name) : [],
            media: media || []
          } as MenuItem;
        }));
        
        // Group items by type for display
        const types = [...new Set(itemsWithDetails.map(item => item.type || 'Other'))];
        
        setMenuItems(itemsWithDetails);
        setMenuTypes(types);
      } catch (error: any) {
        console.error("Error loading menu items:", error);
        toast({
          title: "Error",
          description: "Failed to load restaurant menu",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      fetchMenuItems();
    } else {
      setIsLoading(false);
    }
  }, [restaurantId, toast]);

  if (isLoading) {
    return (
      <div className="bg-white h-full p-4 overflow-y-auto">
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="bg-white h-full p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        <p className="text-gray-600">No menu items available for this restaurant.</p>
      </div>
    );
  }

  return (
    <div className="bg-white h-full p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Menu</h2>
      <div className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.id} className="border-b pb-3">
            <div className="flex justify-between">
              <h3 className="font-medium">{item.name}</h3>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            )}
            
            {item.media && item.media.length > 0 && (
              <MenuItemMedia media={item.media} className="mt-2" />
            )}
            
            {item.ingredients && item.ingredients.length > 0 && (
              <p className="text-xs text-gray-500 mt-1 italic">
                {item.ingredients.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenuPreview;
