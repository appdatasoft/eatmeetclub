
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
          
          // Try multiple potential storage paths with more specific search patterns
          const storagePaths = [
            // Direct item paths
            `menu-items/${restaurantId}/${item.id}`,
            `menu-items/${item.id}`,
            // File naming patterns
            `menu-items/${restaurantId}-${item.id}`,
            // Root path for prefix search
            `menu-items`
          ];
          
          for (const path of storagePaths) {
            try {
              console.log(`Checking for media in path: ${path}`);
              
              let storageData;
              // If checking root path, use search with prefix matching
              if (path === 'menu-items') {
                const { data, error } = await supabase
                  .storage
                  .from('lovable-uploads')
                  .list(path, {
                    limit: 10,
                    search: `${item.id}`
                  });
                storageData = data;
                
                if (error) console.error(`Error searching ${path}:`, error);
              } else {
                // Otherwise list directory directly
                const { data, error } = await supabase
                  .storage
                  .from('lovable-uploads')
                  .list(path);
                storageData = data;
                
                if (error) {
                  // Non-critical error, just log it
                  console.log(`Directory ${path} might not exist:`, error.message);
                  continue;
                }
              }
              
              if (storageData && storageData.length > 0) {
                console.log(`Found ${storageData.length} files in ${path}`);
                
                media = storageData
                  .filter(file => !file.name.endsWith('/')) // Filter out folder names
                  .map(file => {
                    const filePath = path === 'menu-items' 
                      ? `${path}/${file.name}` 
                      : `${path}/${file.name}`;
                      
                    const publicUrl = supabase.storage
                      .from('lovable-uploads')
                      .getPublicUrl(filePath).data.publicUrl;
                    
                    // Check if the file is an image or video based on file extension
                    const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
                    
                    return {
                      url: publicUrl,
                      type: isVideo ? 'video' : 'image'
                    };
                  });
                
                // If we found media, break the loop
                if (media.length > 0) {
                  console.log(`Using media from path: ${path}`);
                  break;
                }
              }
            } catch (storageErr) {
              console.error(`Error accessing storage path ${path}:`, storageErr);
            }
          }
          
          // Try direct filename matching if we still don't have media
          if (media.length === 0) {
            try {
              // Try to find any file that contains the menu item id in its name
              const { data: listData } = await supabase
                .storage
                .from('lovable-uploads')
                .list('menu-items');
                
              if (listData) {
                const matchingFiles = listData.filter(file => 
                  file.name.includes(item.id) || 
                  file.name.includes(item.name.toLowerCase().replace(/\s+/g, '-'))
                );
                
                if (matchingFiles.length > 0) {
                  console.log(`Found ${matchingFiles.length} files with matching name pattern for item ${item.id}`);
                  
                  media = matchingFiles.map(file => {
                    const filePath = `menu-items/${file.name}`;
                    const publicUrl = supabase.storage
                      .from('lovable-uploads')
                      .getPublicUrl(filePath).data.publicUrl;
                      
                    const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
                    
                    return {
                      url: publicUrl,
                      type: isVideo ? 'video' : 'image'
                    };
                  });
                }
              }
            } catch (err) {
              console.error("Error with direct filename matching:", err);
            }
          }
          
          console.log(`Menu item ${item.id} has ${media.length} media items`);
          
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
