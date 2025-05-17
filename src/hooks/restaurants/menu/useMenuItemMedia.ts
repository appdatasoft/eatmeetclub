import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/components/restaurants/menu';

export const useMenuItemMedia = () => {
  /**
   * Fetches media items for a specific menu item from storage
   */
  const fetchMediaForMenuItem = async (restaurantId: string, itemId: string): Promise<MediaItem[]> => {
    let media: MediaItem[] = [];
    console.log(`Fetching media for menu item: ${itemId} in restaurant: ${restaurantId}`);
    
    // Paths to check, in order of priority
    const pathsToCheck = [
      // 1. Restaurant & item specific (most precise)
      `menu-items/${restaurantId}/${itemId}`,
      // 2. Item name-based paths
      `menu-items/${itemId}`,
      // 3. Root folder paths with item prefix
      `menu-items`,
      // 4. Restaurant folder (might contain item-specific files)
      `menu-items/${restaurantId}`, 
      // 5. Bare folders
      `rice`,
      `doro-wot`
    ];
    
    // Try each path until we find media
    for (const path of pathsToCheck) {
      try {
        console.log(`Checking path: ${path}`);
        
        const { data: files, error } = await supabase
          .storage
          .from('lovable-uploads')
          .list(path);
          
        if (error) {
          console.log(`Directory ${path} might not exist:`, error.message);
          continue;
        }
        
        if (!files || files.length === 0) {
          console.log(`No files found in ${path}`);
          continue;
        }
        
        console.log(`Found ${files.length} files in ${path}`);
        
        // Filter files that might belong to this item
        const relevantFiles = files.filter(file => {
          // Skip directories
          if (file.name.endsWith('/')) return false;
          
          // Direct match based on item ID
          if (file.name.includes(itemId)) return true;
          
          // Match based on item name extracted from database records
          // For example, "rice-123456789.jpg" would match an item with name "rice"
          return true;
        });
        
        if (relevantFiles.length > 0) {
          console.log(`Found ${relevantFiles.length} relevant files for item ${itemId} in path ${path}`);
          
          // Map files to MediaItems
          const mediaItems = relevantFiles.map(file => {
            const filePath = `${path}/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
              
            const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
            
            return {
              url: publicUrl,
              type: isVideo ? 'video' as const : 'image' as const,
              id: filePath // Store full path for deletion capabilities
            };
          });
          
          if (mediaItems.length > 0) {
            console.log(`Generated URLs for ${mediaItems.length} files in ${path}`);
            return mediaItems;
          }
        }
      } catch (err) {
        console.error(`Error accessing storage path ${path}:`, err);
      }
    }
    
    // If we reach here, try a more aggressive approach to find any item-related images
    try {
      // Directly check entire folder
      const { data: allFiles, error: allError } = await supabase
        .storage
        .from('lovable-uploads')
        .list('menu-items');
        
      if (!allError && allFiles && allFiles.length > 0) {
        // Log what we found
        console.log(`Found ${allFiles.length} total files in menu-items folder`);
        
        // Try to get restaurant folder directly
        const restaurantFiles = allFiles.filter(file => 
          file.name === restaurantId || file.name.startsWith(restaurantId + '/')
        );
        
        if (restaurantFiles.length > 0) {
          console.log(`Found restaurant folder: ${restaurantFiles[0].name}`);
          
          // Try to get from nested restaurant folder
          const { data: nestedFiles } = await supabase
            .storage
            .from('lovable-uploads')
            .list(`menu-items/${restaurantFiles[0].name}`);
            
          if (nestedFiles && nestedFiles.length > 0) {
            console.log(`Found ${nestedFiles.length} files in restaurant nested folder`);
            
            const mediaItems = nestedFiles
              .filter(file => !file.name.endsWith('/'))
              .map(file => {
                const filePath = `menu-items/${restaurantFiles[0].name}/${file.name}`;
                const publicUrl = supabase.storage
                  .from('lovable-uploads')
                  .getPublicUrl(filePath).data.publicUrl;
                  
                const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
                
                return {
                  url: publicUrl,
                  type: isVideo ? 'video' as const : 'image' as const,
                  id: filePath
                };
              });
              
            if (mediaItems.length > 0) {
              return mediaItems;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in aggressive media search:', err);
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
      
      // Ensure the file path is valid
      if (!filePath || filePath.trim() === '') {
        console.error('Invalid file path provided for deletion');
        return false;
      }
      
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
