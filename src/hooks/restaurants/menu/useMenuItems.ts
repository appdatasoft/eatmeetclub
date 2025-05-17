
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
            
            // Try to get the media items associated with this menu item from storage
            const media = await fetchMenuItemMedia(restaurantId, item.id);
            
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

  // Function to fetch media for a menu item from Supabase storage
  const fetchMenuItemMedia = async (restaurantId: string, itemId: string) => {
    try {
      const mediaPaths = [
        `menu-items/${restaurantId}/${itemId}`,
        `menu-items/${itemId}`
      ];
      
      for (const path of mediaPaths) {
        const { data: files, error } = await supabase.storage
          .from('lovable-uploads')
          .list(path);
          
        if (error) {
          console.log(`No files found in path: ${path}`);
          continue;
        }
        
        if (files && files.length > 0) {
          // Filter out directories
          const mediaFiles = files.filter(file => !file.name.endsWith('/'));
          
          if (mediaFiles.length > 0) {
            return mediaFiles.map(file => {
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
          }
        }
      }
      
      // If no files found in specific paths, check the root directory
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('lovable-uploads')
        .list('menu-items');
        
      if (!rootError && rootFiles && rootFiles.length > 0) {
        const matchingFiles = rootFiles.filter(file => 
          file.name.toLowerCase().includes(itemId.toLowerCase()) ||
          file.name.toLowerCase().includes(restaurantId.toLowerCase())
        );
        
        if (matchingFiles.length > 0) {
          return matchingFiles.map(file => {
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
      
      // Fallback to static images - only if no images are found in storage
      return [{
        url: "https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&w=300&h=300",
        type: "image"
      }];
    } catch (error) {
      console.error('Error fetching menu item media:', error);
      return [{
        url: "https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&w=300&h=300",
        type: "image"
      }];
    }
  };

  return { menuItems, setMenuItems, isLoading, error };
};
