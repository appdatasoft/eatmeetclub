
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/components/restaurants/menu/MenuItemMediaUploader';

export const useMenuItemMedia = () => {
  /**
   * Fetches media items for a specific menu item from storage
   */
  const fetchMediaForMenuItem = async (restaurantId: string, itemId: string): Promise<MediaItem[]> => {
    let media: MediaItem[] = [];
    console.log(`Fetching media for menu item: ${itemId} in restaurant: ${restaurantId}`);
    
    // First check for media in item-specific directories - this is the most reliable way
    // to ensure we're getting the right media for the right item
    const itemSpecificPath = `menu-items/${restaurantId}/${itemId}`;
    
    try {
      console.log(`Checking for media in item-specific path: ${itemSpecificPath}`);
      
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('lovable-uploads')
        .list(itemSpecificPath);
        
      if (storageError) {
        console.log(`Directory ${itemSpecificPath} might not exist:`, storageError.message);
      } else if (storageData && storageData.length > 0) {
        console.log(`Found ${storageData.length} files in ${itemSpecificPath}`);
        
        media = storageData
          .filter(file => !file.name.endsWith('/'))
          .map(file => {
            const filePath = `${itemSpecificPath}/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
            
            const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
            
            return {
              url: publicUrl,
              type: isVideo ? 'video' : 'image',
              id: file.name // Include filename as ID to help with deletion
            };
          });
        
        if (media.length > 0) {
          console.log(`Generated URLs for ${media.length} files in ${itemSpecificPath}`);
          return media;
        }
      }
    } catch (storageErr) {
      console.error(`Error accessing storage path ${itemSpecificPath}:`, storageErr);
    }
    
    // If no specific media found, look for alternative paths
    const alternativePaths = [
      `menu-items/${itemId}`
    ];
    
    for (const path of alternativePaths) {
      try {
        console.log(`Checking alternative path: ${path}`);
        
        const { data: altData, error: altError } = await supabase
          .storage
          .from('lovable-uploads')
          .list(path);
          
        if (altError) {
          console.log(`Directory ${path} might not exist:`, altError.message);
          continue;
        }
        
        if (altData && altData.length > 0) {
          console.log(`Found ${altData.length} files in ${path}`);
          
          const altMedia = altData
            .filter(file => !file.name.endsWith('/'))
            .map(file => {
              const filePath = `${path}/${file.name}`;
              const publicUrl = supabase.storage
                .from('lovable-uploads')
                .getPublicUrl(filePath).data.publicUrl;
                
              const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
              
              return {
                url: publicUrl,
                type: isVideo ? 'video' : 'image',
                id: file.name // Include filename as ID
              };
            });
          
          if (altMedia.length > 0) {
            console.log(`Generated URLs for ${altMedia.length} files in ${path}`);
            return altMedia;
          }
        }
      } catch (altErr) {
        console.error(`Error accessing storage path ${path}:`, altErr);
      }
    }
    
    // Return empty array if no media found
    console.log(`No media found for item ${itemId}, returning empty array`);
    return [];
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
  
  /**
   * Deletes a media item
   */
  const deleteMediaItem = async (filePath: string): Promise<boolean> => {
    try {
      console.log(`Attempting to delete file: ${filePath}`);
      
      const { data, error } = await supabase
        .storage
        .from('lovable-uploads')
        .remove([filePath]);
        
      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }
      
      console.log('File deleted successfully:', filePath);
      return true;
    } catch (err) {
      console.error('Error in deleteMediaItem:', err);
      return false;
    }
  };
  
  return {
    fetchMediaForMenuItem,
    fetchIngredientsForMenuItem,
    deleteMediaItem
  };
};
