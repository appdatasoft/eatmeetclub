
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/components/restaurants/menu/MenuItemMediaUploader";

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
    
    // Define all possible paths where media might be stored
    const mediaPaths = [
      `menu-items/${restaurantId}/${item.id}`,
      `menu-items/${item.id}`,
      `menu-items/${restaurantId}`,
      `menu-items` // root directory
    ];
    
    // Try each path until we find media
    for (const path of mediaPaths) {
      try {
        console.log(`Checking path: ${path}`);
        const { data: files, error } = await supabase.storage
          .from('lovable-uploads')
          .list(path);
          
        if (error) {
          console.log(`No files found in path: ${path} - ${error.message}`);
          continue;
        }
        
        if (files && files.length > 0) {
          // Filter out directories and look for files that might match our item
          const mediaFiles = files.filter(file => {
            // Don't include directories
            if (file.name.endsWith('/')) return false;
            
            // If we're in a specific item directory, include all files
            if (path.includes(item.id)) return true;
            
            // If we're in a restaurant or root directory, look for filename patterns that match the item
            const lowerFileName = file.name.toLowerCase();
            const lowerId = item.id.toLowerCase();
            const lowerName = item.name.toLowerCase().replace(/\s+/g, '-');
            
            return lowerFileName.includes(lowerId) ||
                   lowerFileName.includes(lowerName);
          });
          
          if (mediaFiles.length > 0) {
            console.log(`Found ${mediaFiles.length} matching files in ${path}`);
            
            // Convert file references to media items with public URLs
            const media = mediaFiles.map(file => {
              const filePath = `${path}/${file.name}`;
              const publicUrl = supabase.storage
                .from('lovable-uploads')
                .getPublicUrl(filePath).data.publicUrl;
                
              // Determine if video based on file extension
              const isVideo = file.name.match(/\.(mp4|webm|mov|avi|wmv)$/i) !== null;
              const fileType: "video" | "image" = isVideo ? "video" : "image";
              
              console.log(`Created media item: ${publicUrl} (${fileType})`);
              
              return {
                url: publicUrl,
                type: fileType
              };
            });
            
            console.log(`Returning ${media.length} media items for ${item.name}`);
            return media;
          }
        } else {
          console.log(`No files found in path: ${path}`);
        }
      } catch (error) {
        console.error(`Error checking path ${path}:`, error);
      }
    }
    
    // Additional check for files directly in the root with explicit name matching
    try {
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('lovable-uploads')
        .list('menu-items');
        
      if (!rootError && rootFiles && rootFiles.length > 0) {
        console.log(`Checking root directory for files matching item ID: ${item.id}`);
        
        // Look for exact item ID or name matches in filenames
        const exactMatches = rootFiles.filter(file => {
          if (file.name.endsWith('/')) return false;
          const lowerFileName = file.name.toLowerCase();
          return lowerFileName.includes(item.id.toLowerCase());
        });
        
        if (exactMatches.length > 0) {
          console.log(`Found ${exactMatches.length} exact matches in root directory`);
          
          const media = exactMatches.map(file => {
            const filePath = `menu-items/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
              
            const isVideo = file.name.match(/\.(mp4|webm|mov|avi|wmv)$/i) !== null;
            const fileType: "video" | "image" = isVideo ? "video" : "image";
            
            return {
              url: publicUrl,
              type: fileType
            };
          });
          
          return media;
        }
      }
    } catch (error) {
      console.error('Error checking root directory for exact matches:', error);
    }
    
    // If no media found after all checks, try looking for restaurant-specific media
    // that might be useful as generic item images
    console.log(`No specific media found for ${item.name}, checking restaurant media...`);
    
    try {
      const restaurantPath = `menu-items/${restaurantId}`;
      const { data: restaurantFiles, error: restaurantError } = await supabase.storage
        .from('lovable-uploads')
        .list(restaurantPath);
        
      if (!restaurantError && restaurantFiles && restaurantFiles.length > 0) {
        const mediaFiles = restaurantFiles.filter(file => !file.name.endsWith('/'));
        
        if (mediaFiles.length > 0) {
          console.log(`Found ${mediaFiles.length} restaurant images as fallback`);
          
          const media = mediaFiles.map(file => {
            const filePath = `${restaurantPath}/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
              
            const isVideo = file.name.match(/\.(mp4|webm|mov|avi|wmv)$/i) !== null;
            const fileType: "video" | "image" = isVideo ? "video" : "image";
            
            return {
              url: publicUrl,
              type: fileType
            };
          });
          
          // Just use the first few as generic item images
          return media.slice(0, 3);
        }
      }
    } catch (error) {
      console.error('Error checking restaurant directory:', error);
    }
    
    // If all methods fail to find media, try one last direct check
    // Try to access a file directly with the item ID
    try {
      console.log(`Trying direct file access with item ID: ${item.id}`);
      
      // Look for a direct match using the item ID at the root of menu-items
      const directPath = `menu-items/${item.id}`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from('lovable-uploads')
        .download(directPath);
        
      if (!fileError && fileData) {
        const publicUrl = supabase.storage
          .from('lovable-uploads')
          .getPublicUrl(directPath).data.publicUrl;
          
        console.log(`Found direct file match: ${publicUrl}`);
        
        return [{
          url: publicUrl,
          type: "image"
        }];
      }
    } catch (error) {
      console.log('Direct file access attempt failed:', error);
    }
    
    // If still no media found, return empty array
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
