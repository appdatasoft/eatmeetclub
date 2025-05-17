
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/components/restaurants/menu";
import { addCacheBuster, getDefaultFoodPlaceholder } from "@/utils/supabaseStorage";

/**
 * Fetches media items for a specific menu item from various possible storage paths
 */
export async function fetchMenuItemMedia(restaurantId: string, item: { id: string, name: string }): Promise<MediaItem[]> {
  try {
    console.log(`Fetching media for item ${item.name} (${item.id}) in restaurant ${restaurantId}`);
    
    // Check if restaurantId and itemId are valid
    if (!restaurantId || !item.id) {
      console.log('Missing restaurantId or itemId, returning placeholder');
      return [{
        url: getDefaultFoodPlaceholder(),
        type: 'image',
        id: 'placeholder',
        isPlaceholder: true
      }];
    }

    // First check if we have media records in the database
    const { data: mediaRecords, error: mediaError } = await supabase
      .from('restaurant_menu_media')
      .select('*')
      .eq('menu_item_id', item.id);
      
    if (!mediaError && mediaRecords && mediaRecords.length > 0) {
      console.log(`Found ${mediaRecords.length} media records in database for item ${item.id}`);
      
      // Convert records to MediaItems
      return mediaRecords.map(record => ({
        url: addCacheBuster(record.url),
        type: record.media_type as 'image' | 'video',
        id: record.storage_path || record.id,
      }));
    }
    
    // Fallback to checking storage paths directly (for backward compatibility)
    // Try common paths for item media
    const pathsToTry = [
      `menu-items/${item.id}`,
      `menu-items/${restaurantId}/${item.id}`
    ];
    
    // Try each path until we find media
    for (const path of pathsToTry) {
      try {
        console.log(`Checking path: ${path}`);
        const { data: files, error } = await supabase.storage
          .from('lovable-uploads')
          .list(path);
          
        if (!error && files && files.length > 0) {
          // Filter out directories and get valid media files
          const mediaFiles = files.filter(file => !file.name.endsWith('/'));
          
          if (mediaFiles.length > 0) {
            console.log(`Found ${mediaFiles.length} files in path ${path}`);
            
            return mediaFiles.map(file => {
              const filePath = `${path}/${file.name}`;
              const publicUrl = supabase.storage
                .from('lovable-uploads')
                .getPublicUrl(filePath).data.publicUrl;
                
              // Determine if video based on file extension
              const isVideo = file.name.match(/\.(mp4|webm|mov|avi|wmv)$/i) !== null;
              const fileType: "video" | "image" = isVideo ? "video" : "image";
              
              return {
                url: addCacheBuster(publicUrl),
                type: fileType,
                id: filePath
              };
            });
          }
        }
      } catch (error) {
        console.error(`Error checking path ${path}:`, error);
      }
    }
    
    // Create a fallback media item with placeholder as last resort
    console.log(`No media found for ${item.name} after all attempts, using placeholder`);
    return [{
      url: getDefaultFoodPlaceholder(),
      type: 'image',
      id: 'placeholder',
      isPlaceholder: true
    }];
    
  } catch (error) {
    console.error('Error in fetchMenuItemMedia:', error);
    return [{
      url: getDefaultFoodPlaceholder(),
      type: 'image',
      id: 'placeholder',
      isPlaceholder: true
    }];
  }
}

/**
 * Fetches ingredients for a specific menu item
 */
export async function fetchMenuItemIngredients(itemId: string): Promise<string[]> {
  try {
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('restaurant_menu_ingredients')
      .select('name')
      .eq('menu_item_id', itemId);
      
    if (ingredientsError) {
      console.error("Error fetching ingredients:", ingredientsError);
      return [];
    }
    
    return ingredientsData ? ingredientsData.map(ing => ing.name) : [];
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return [];
  }
}
