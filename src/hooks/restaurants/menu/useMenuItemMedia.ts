
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/components/restaurants/menu/MenuItemMediaUploader';

export const useMenuItemMedia = () => {
  /**
   * Fetches media items for a specific menu item from storage
   */
  const fetchMediaForMenuItem = async (restaurantId: string, itemId: string): Promise<MediaItem[]> => {
    let media: MediaItem[] = [];
    console.log(`Fetching media for menu item: ${itemId} in restaurant: ${restaurantId}`);
    
    // First check for media in item-specific directories
    const storagePaths = [
      `menu-items/${restaurantId}/${itemId}`,
      `menu-items/${itemId}`
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
            console.log(`Generated URLs for ${media.length} files in ${path}`);
            foundMedia = true;
            break;
          }
        }
      } catch (storageErr) {
        console.error(`Error accessing storage path ${path}:`, storageErr);
      }
    }
    
    // If no media found, check the root menu-items directory for files that match the item id
    if (!foundMedia) {
      try {
        console.log(`Checking root menu-items directory for item ID: ${itemId}`);
        
        const { data: rootData, error: rootError } = await supabase
          .storage
          .from('lovable-uploads')
          .list('menu-items', { limit: 100 });
          
        if (rootError) {
          console.log(`Error listing root menu-items directory:`, rootError.message);
        } else if (rootData && rootData.length > 0) {
          const matchingFiles = rootData.filter(file => 
            file.name.toLowerCase().includes(itemId.toLowerCase())
          );
          
          if (matchingFiles.length > 0) {
            console.log(`Found ${matchingFiles.length} matching files in root directory`);
            
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
        console.error(`Error checking root menu-items directory:`, rootErr);
      }
    }
    
    // If still no media found, use a static fallback
    if (media.length === 0) {
      console.log(`No media found for item ${itemId}, using fallback`);
      
      // Use a static fallback image
      const fallbackImage = {
        url: "https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&w=300&h=300",
        type: "image" as const
      };
      
      media.push(fallbackImage);
    }
    
    return media;
  };
  
  /**
   * Fetches ingredients for a specific menu item
   */
  const fetchIngredientsForMenuItem = async (itemId: string): Promise<string[]> => {
    try {
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('restaurant_menu_ingredients')
        .select('name')
        .eq('menu_item_id', itemId);
      
      if (ingredientsError) {
        console.error(`Error fetching ingredients for item ${itemId}:`, ingredientsError);
        return [];
      }
      
      return ingredientsData ? ingredientsData.map(ing => ing.name) : [];
    } catch (err) {
      console.error(`Error in fetchIngredientsForMenuItem for item ${itemId}:`, err);
      return [];
    }
  };
  
  return {
    fetchMediaForMenuItem,
    fetchIngredientsForMenuItem
  };
};
