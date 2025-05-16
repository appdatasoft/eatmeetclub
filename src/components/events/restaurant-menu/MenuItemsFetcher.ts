
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "./types";
import { MediaItem } from "@/components/restaurants/menu/MenuItemMediaUploader";

interface FetcherResult {
  menuItems: MenuItem[];
  menuTypes: string[];
  isLoading: boolean;
  error: string | null;
}

export const useMenuItemsFetcher = (restaurantId: string): FetcherResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuTypes, setMenuTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  search: `${item.id}-`
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
        setError("Failed to load restaurant menu");
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      fetchMenuItems();
    } else {
      setIsLoading(false);
    }
  }, [restaurantId]);

  return { menuItems, menuTypes, isLoading, error };
};
