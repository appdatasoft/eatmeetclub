
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';

export const useMenuItems = (restaurantId: string | undefined) => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching menu items for restaurant:", restaurantId);
        
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);
          
        if (menuError) {
          throw menuError;
        }
        
        if (menuData && menuData.length > 0) {
          console.log(`Found ${menuData.length} menu items for restaurant ${restaurantId}`);
          
          // For each menu item, fetch its ingredients and media items
          const itemsWithDetails = await Promise.all(menuData.map(async (item) => {
            console.log(`Processing menu item: ${item.name} (${item.id})`);
            
            // Fetch ingredients for this menu item
            const { data: ingredientsData, error: ingredientsError } = await supabase
              .from('restaurant_menu_ingredients')
              .select('name')
              .eq('menu_item_id', item.id);
              
            if (ingredientsError) {
              console.error(`Error fetching ingredients for item ${item.id}:`, ingredientsError);
            }
            
            const ingredients = ingredientsData ? ingredientsData.map(ing => ing.name) : [];
            
            // Try to get the media files for this menu item
            let media: {url: string, type: "image" | "video"}[] = [];
            
            // Check specific directories first
            const mediaPaths = [
              `menu-items/${restaurantId}/${item.id}`,
              `menu-items/${item.id}`
            ];
            
            let foundMedia = false;
            for (const path of mediaPaths) {
              try {
                const { data: files, error: filesError } = await supabase.storage
                  .from('lovable-uploads')
                  .list(path);
                  
                if (!filesError && files && files.length > 0) {
                  const mediaFiles = files.filter(file => !file.name.endsWith('/'));
                  
                  if (mediaFiles.length > 0) {
                    console.log(`Found ${mediaFiles.length} media files in ${path}`);
                    
                    media = mediaFiles.map(file => {
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
                    
                    foundMedia = true;
                    break;
                  }
                }
              } catch (err) {
                console.error(`Error checking path ${path}:`, err);
              }
            }
            
            // If no media found in specific directories, check root directory
            if (!foundMedia) {
              try {
                const { data: rootFiles, error: rootError } = await supabase.storage
                  .from('lovable-uploads')
                  .list('menu-items');
                  
                if (!rootError && rootFiles && rootFiles.length > 0) {
                  const itemId = item.id.toLowerCase();
                  const itemName = item.name.toLowerCase().replace(/\s+/g, '-');
                  
                  const matchingFiles = rootFiles.filter(file => 
                    !file.name.endsWith('/') && (
                      file.name.toLowerCase().includes(itemId) ||
                      file.name.toLowerCase().includes(itemName)
                    )
                  );
                  
                  if (matchingFiles.length > 0) {
                    console.log(`Found ${matchingFiles.length} matching files in root directory for ${item.name}`);
                    
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
                    
                    foundMedia = true;
                  }
                }
              } catch (rootErr) {
                console.error('Error checking root directory:', rootErr);
              }
            }
            
            // If no images found at all, leave media array empty
            if (media.length === 0) {
              console.log(`No media found for item: ${item.name}`);
            }
            
            // Transform to match our MenuItem interface
            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'Other', // Default type since it's not in the database
              ingredients: ingredients,
              media: media
            } as MenuItem;
          }));
          
          console.log(`Processed ${itemsWithDetails.length} menu items with details`);
          setMenuItems(itemsWithDetails);
        } else {
          console.log(`No menu items found for restaurant ${restaurantId}`);
          setMenuItems([]);
        }
      } catch (error: any) {
        console.error('Error fetching menu items:', error);
        setError(error.message || 'Failed to load menu items');
        toast({
          title: 'Error',
          description: error.message || 'Failed to load menu items',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [restaurantId, toast]);

  return { menuItems, setMenuItems, isLoading, error };
};
