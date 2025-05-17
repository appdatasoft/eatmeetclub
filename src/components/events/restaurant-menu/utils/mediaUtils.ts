
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/components/restaurants/menu";
import { addCacheBuster, generateAlternativeUrls, findWorkingImageUrl, getDefaultFoodPlaceholder } from "@/utils/supabaseStorage";

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
              url: addCacheBuster(publicUrl),
              type: fileType,
              id: filePath // Store path for deletion capabilities
            };
          });
        }
      }
    } catch (error) {
      console.error(`Error checking primary path ${primaryPath}:`, error);
    }
    
    // Find a working image URL as fallback
    try {
      const workingUrl = await findWorkingImageUrl(restaurantId, item.id);
      
      if (workingUrl) {
        console.log(`Found working direct URL for item ${item.name}:`, workingUrl);
        
        return [{
          url: workingUrl,
          type: 'image',
          id: workingUrl.split('?')[0] // Store the URL without query params as ID
        }];
      }
    } catch (err) {
      console.error(`Error finding working URL for ${item.name}:`, err);
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
              url: addCacheBuster(publicUrl),
              type: fileType,
              id: filePath
            };
          });
        }
      }
    } catch (error) {
      console.error(`Error checking fallback path ${fallbackPath}:`, error);
    }
    
    // Try direct file URLs as a last resort
    try {
      // Generate list of possible direct URLs
      const alternativeUrls = generateAlternativeUrls(restaurantId, item.id);
      console.log(`Trying ${alternativeUrls.length} alternative URL patterns for ${item.name}`);
      
      // Check each URL with HEAD request
      const urlChecks = alternativeUrls.slice(0, 4).map(async (url) => { 
        // Only check first 4 to avoid too many requests
        try {
          const response = await fetch(url, { method: 'HEAD' });
          return response.ok ? url : null;
        } catch (_) {
          return null;
        }
      });
      
      const validUrls = (await Promise.all(urlChecks)).filter(Boolean) as string[];
      
      if (validUrls.length > 0) {
        console.log(`Found ${validUrls.length} valid direct URLs for item ${item.id}`, validUrls[0]);
        
        return validUrls.map(url => ({
          url,
          type: 'image',
          id: url.split('?')[0] // Store the URL without query params as ID
        }));
      }
    } catch (err) {
      console.error(`Error in alternative URL check for ${item.name}:`, err);
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
export async function fetchMenuItemIngredients(itemId: string): Promise<string[]> => {
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
};
