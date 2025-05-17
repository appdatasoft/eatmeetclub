
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from "@/components/restaurants/menu";
import { addCacheBuster, getDefaultFoodPlaceholder } from '@/utils/supabaseStorage';

/**
 * Fetches media items for a specific menu item from storage
 */
export const fetchMediaForMenuItem = async (restaurantId: string, itemId: string): Promise<MediaItem[]> => {
  let media: MediaItem[] = [];
  console.log(`Fetching media for menu item: ${itemId} in restaurant: ${restaurantId}`);
  
  // Get media items linked to this menu item from the database first
  try {
    const { data, error } = await supabase
      .from('restaurant_menu_media')
      .select('id, url, media_type, storage_path')
      .eq('menu_item_id', itemId);
    
    if (error) {
      console.error("Error fetching menu item media from database:", error.message);
    } else if (data && data.length > 0) {
      console.log(`Found ${data.length} media items in database for item ${itemId}`);
      
      // Convert database records to MediaItems
      return data.map(item => ({
        url: addCacheBuster(item.url),
        type: item.media_type as 'image' | 'video',
        id: item.storage_path || item.id,
      }));
    }
  } catch (err) {
    console.error("Error checking menu item media:", err);
  }
  
  // If no media found in the dedicated table, check direct storage paths as fallback
  // This helps with backward compatibility for previously uploaded media
  const pathsToCheck = [
    `menu-items/${itemId}`,
    `menu-items/${restaurantId}/${itemId}`
  ];
  
  // Try each path until we find media
  for (const path of pathsToCheck) {
    try {
      console.log(`Checking directory path: ${path}`);
      const { data: files, error } = await supabase
        .storage
        .from('lovable-uploads')
        .list(path, { sortBy: { column: 'name', order: 'asc' } });
        
      if (error) {
        console.log(`Directory ${path} might not exist:`, error.message);
        continue;
      }
      
      if (!files || files.length === 0) {
        console.log(`No files found in ${path}`);
        continue;
      }
      
      // Filter files that might belong to this item
      const relevantFiles = files.filter(file => {
        // Skip directories
        if (file.name.endsWith('/')) return false;
        return true; // Include all files in the path
      });
      
      if (relevantFiles.length > 0) {
        console.log(`Found ${relevantFiles.length} relevant files for item ${itemId}`);
        
        // Map files to MediaItems
        const mediaItems = relevantFiles.map(file => {
          const filePath = `${path}/${file.name}`;
          const publicUrl = supabase.storage
            .from('lovable-uploads')
            .getPublicUrl(filePath).data.publicUrl;
            
          const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
          
          // Add cache buster parameter to the URL
          const urlWithCache = addCacheBuster(publicUrl);
          
          return {
            url: urlWithCache,
            type: isVideo ? 'video' as const : 'image' as const,
            id: filePath // Store full path for deletion capabilities
          };
        });
        
        if (mediaItems.length > 0) {
          console.log(`Successfully mapped ${mediaItems.length} media items`);
          return mediaItems;
        }
      }
    } catch (err) {
      console.error(`Error accessing storage path ${path}:`, err);
    }
  }
  
  // Create a fallback media item with placeholder image as last resort
  console.log(`No media found for menu item ${itemId}, using placeholder`);
  return [{
    url: getDefaultFoodPlaceholder(),
    type: 'image',
    id: 'placeholder',
    isPlaceholder: true
  }];
};

/**
 * Fetches ingredients for a specific menu item
 */
export const fetchIngredientsForMenuItem = async (itemId: string): Promise<string[]> => {
  try {
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('restaurant_menu_ingredients')
      .select('name')
      .eq('menu_item_id', itemId);
    
    if (ingredientsError) {
      console.error(`Error fetching ingredients:`, ingredientsError);
      return [];
    }
    
    return ingredientsData ? ingredientsData.map(ing => ing.name) : [];
  } catch (err) {
    console.error(`Error in fetchIngredientsForMenuItem:`, err);
    return [];
  }
};
