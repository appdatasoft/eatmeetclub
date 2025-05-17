import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/components/restaurants/menu";

/**
 * Fetches media items for a specific menu item from various possible storage paths
 */
export async function fetchMenuItemMedia(restaurantId: string, item: { id: string, name: string }): Promise<MediaItem[]> {
  try {
    console.log(`Fetching media for item ${item.name} (${item.id}) in restaurant ${restaurantId}`);
    
    // Check if restaurantId and itemId are valid
    if (!restaurantId || !item.id) {
      console.log('Missing restaurantId or itemId, returning empty media array');
      return [];
    }
    
    // Main path - this should be the primary location where images are stored
    const primaryPath = `menu-items/${restaurantId}/${item.id}`;
    
    try {
      console.log(`Checking primary path: ${primaryPath}`);
      const { data: files, error } = await supabase.storage
        .from('lovable-uploads')
        .list(primaryPath);
        
      if (!error && files && files.length > 0) {
        // Filter out directories and get valid media files
        const mediaFiles = files.filter(file => !file.name.endsWith('/'));
        
        if (mediaFiles.length > 0) {
          console.log(`Found ${mediaFiles.length} files in primary path ${primaryPath}`);
          
          return mediaFiles.map(file => {
            const filePath = `${primaryPath}/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
              
            // Determine if video based on file extension
            const isVideo = file.name.match(/\.(mp4|webm|mov|avi|wmv)$/i) !== null;
            const fileType: "video" | "image" = isVideo ? "video" : "image";
            
            return {
              url: publicUrl,
              type: fileType,
              id: filePath // Store path for deletion capabilities
            };
          });
        }
      }
    } catch (error) {
      console.error(`Error checking primary path ${primaryPath}:`, error);
    }
    
    // Fallback path - just the item ID
    const fallbackPath = `menu-items/${item.id}`;
    
    try {
      console.log(`Checking fallback path: ${fallbackPath}`);
      const { data: fallbackFiles, error: fallbackError } = await supabase.storage
        .from('lovable-uploads')
        .list(fallbackPath);
        
      if (!fallbackError && fallbackFiles && fallbackFiles.length > 0) {
        const mediaFiles = fallbackFiles.filter(file => !file.name.endsWith('/'));
        
        if (mediaFiles.length > 0) {
          console.log(`Found ${mediaFiles.length} files in fallback path ${fallbackPath}`);
          
          return mediaFiles.map(file => {
            const filePath = `${fallbackPath}/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
              
            const isVideo = file.name.match(/\.(mp4|webm|mov|avi|wmv)$/i) !== null;
            const fileType: "video" | "image" = isVideo ? "video" : "image";
            
            return {
              url: publicUrl,
              type: fileType,
              id: filePath
            };
          });
        }
      }
    } catch (error) {
      console.error(`Error checking fallback path ${fallbackPath}:`, error);
    }
    
    // If no media found, return empty array rather than placeholder
    console.log(`No media found for ${item.name} after all attempts`);
    return [];
    
  } catch (error) {
    console.error('Error in fetchMenuItemMedia:', error);
    return [];
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
