
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
          
          // Try to get media items with better error handling
          let media: MediaItem[] = [];
          
          // First check for media in item-specific directories
          const storagePaths = [
            `menu-items/${restaurantId}/${item.id}`,
            `menu-items/${item.id}`
          ];
          
          let foundMedia = false;
          for (const path of storagePaths) {
            try {
              console.log(`Checking for media in path: ${path}`);
              
              const { data: storageData, error: storageError } = await supabase
                .storage
                .from('lovable-uploads')
                .list(path);
                
              if (storageError) {
                console.log(`Directory ${path} might not exist:`, storageError.message);
                continue;
              }
              
              if (storageData && storageData.length > 0) {
                console.log(`Found ${storageData.length} files in ${path}`);
                
                media = storageData
                  .filter(file => !file.name.endsWith('/'))
                  .map(file => {
                    const filePath = `${path}/${file.name}`;
                    const publicUrl = supabase.storage
                      .from('lovable-uploads')
                      .getPublicUrl(filePath).data.publicUrl;
                    
                    const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
                    
                    return {
                      url: publicUrl,
                      type: isVideo ? 'video' : 'image'
                    };
                  });
                
                if (media.length > 0) {
                  foundMedia = true;
                  break;
                }
              }
            } catch (storageErr) {
              console.error(`Error accessing storage path ${path}:`, storageErr);
            }
          }
          
          // If no media found, check the root menu-items directory
          if (!foundMedia) {
            try {
              console.log("Checking for files directly in menu-items directory");
              
              // Get all files in the menu-items directory
              const { data: listData, error: listError } = await supabase
                .storage
                .from('lovable-uploads')
                .list('menu-items', { limit: 1000 });
              
              if (listError) {
                console.error("Error listing media:", listError);
              } else if (listData) {
                // Match filenames that might contain the item id or name
                const matchingFiles = listData.filter(file => 
                  file.name.toLowerCase().includes(item.id) || 
                  file.name.toLowerCase().includes(item.name.toLowerCase().replace(/\s+/g, '-'))
                );
                
                if (matchingFiles.length > 0) {
                  console.log(`Found ${matchingFiles.length} files with matching name pattern for item ${item.id}:`, 
                              matchingFiles.map(f => f.name).join(', '));
                  
                  media = matchingFiles.map(file => {
                    const filePath = `menu-items/${file.name}`;
                    const publicUrl = supabase.storage
                      .from('lovable-uploads')
                      .getPublicUrl(filePath).data.publicUrl;
                      
                    const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
                    
                    console.log(`Generated URL for ${file.name}:`, publicUrl);
                    
                    return {
                      url: publicUrl,
                      type: isVideo ? 'video' : 'image'
                    };
                  });
                } else {
                  console.log(`No matching files found for item ${item.id} (${item.name}) in menu-items directory`);
                }
              }
            } catch (err) {
              console.error("Error with directory listing:", err);
            }
          }
          
          console.log(`Menu item ${item.id} (${item.name}) has ${media.length} media items`);
          if (media.length > 0) {
            console.log(`First media URL: ${media[0].url}`);
          }
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            type: '', // This doesn't exist in the database schema
            ingredients: ingredientsData ? ingredientsData.map(ing => ing.name) : [],
            media: media
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
