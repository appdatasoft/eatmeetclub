
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/components/restaurants/menu/MenuItemMediaUploader";

/**
 * Fetches media items for a specific menu item from various possible storage paths
 */
export async function fetchMenuItemMedia(restaurantId: string, item: { id: string, name: string }): Promise<MediaItem[]> {
  let media: MediaItem[] = [];
  console.log(`Starting fetchMenuItemMedia for ${item.name} (${item.id})`);
  
  // First check for media in item-specific directories
  const storagePaths = [
    `menu-items/${restaurantId}/${item.id}`,
    `menu-items/${item.id}`
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
  
  // If no media found in specific paths, check the root menu-items directory and use fuzzy matching
  if (!foundMedia) {
    try {
      console.log("Checking for files directly in menu-items directory");
      console.log("Looking for item name or ID:", item.name, item.id);
      
      // Get all files in the menu-items directory with increased limit
      const { data: listData, error: listError } = await supabase
        .storage
        .from('lovable-uploads')
        .list('menu-items', { limit: 1000 });
      
      if (listError) {
        console.error("Error listing media:", listError);
      } else if (listData && listData.length > 0) {
        console.log(`Found ${listData.length} total files in menu-items directory`);
        
        // Enhanced logging for debugging
        console.log("Matching against:", item.name.toLowerCase(), "or ID:", item.id);
        
        // Match filenames that contain the item name or ID (case insensitive)
        const itemNameLower = item.name.toLowerCase().trim();
        const itemId = item.id.toLowerCase().trim();
        
        const matchingFiles = listData.filter(file => {
          const fileNameLower = file.name.toLowerCase();
          return (
            fileNameLower.includes(itemNameLower) || 
            fileNameLower.includes(itemId) ||
            // Additional matching for common patterns
            fileNameLower.includes(itemNameLower.substring(0, 5)) || // Match first 5 chars
            fileNameLower.includes(itemNameLower.replace(/\s+/g, '-')) || // Match kebab-case
            fileNameLower.includes(itemNameLower.replace(/\s+/g, '_'))   // Match snake_case
          );
        });
        
        if (matchingFiles.length > 0) {
          console.log(`Found ${matchingFiles.length} files with matching name pattern for item ${item.name}:`, 
                     matchingFiles.map(f => f.name).join(', '));
          
          media = matchingFiles.map(file => {
            const filePath = `menu-items/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
              
            const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
            
            console.log(`Generated URL for ${file.name}:`, publicUrl);
            
            return {
              url: publicUrl,
              type: isVideo ? 'video' : 'image'
            };
          });
        } else {
          console.log(`No matching files found for item ${item.name} in menu-items directory`);
          
          // Default: Use a food-related image from Unsplash as fallback
          const fallbackImageUrl = `https://source.unsplash.com/300x300/?food,${encodeURIComponent(item.name)}`;
          console.log(`Using fallback image for ${item.name}:`, fallbackImageUrl);
          
          media = [{
            url: fallbackImageUrl,
            type: 'image'
          }];
        }
      }
    } catch (err) {
      console.error("Error with directory listing:", err);
    }
  }
  
  if (media.length > 0) {
    console.log(`Final media array for ${item.name} has ${media.length} items:`, media.map(m => m.url));
  } else {
    console.log(`No media found for item ${item.name}, using fallback image`);
    
    // Always ensure at least one placeholder image
    const fallbackImageUrl = `https://source.unsplash.com/300x300/?food,${encodeURIComponent(item.name)}`;
    media = [{
      url: fallbackImageUrl,
      type: 'image'
    }];
  }
  
  return media;
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
