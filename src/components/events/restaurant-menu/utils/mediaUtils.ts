
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
          
          // Use predefined static fallback images instead of dynamic Unsplash URLs
          const fallbackImageUrl = getStaticFallbackImage(item.name);
          console.log(`Using static fallback image for ${item.name}:`, fallbackImageUrl);
          
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
    console.log(`No media found for item ${item.name}, using static fallback image`);
    
    // Always ensure at least one placeholder image using static URLs
    const fallbackImageUrl = getStaticFallbackImage(item.name);
    media = [{
      url: fallbackImageUrl,
      type: 'image'
    }];
  }
  
  return media;
}

/**
 * Returns a static fallback image URL based on the item name
 * Using predefined Unsplash images to avoid the dynamic API calls that can fail
 */
function getStaticFallbackImage(itemName: string): string {
  // Array of reliable, pre-cached food images from Unsplash
  const fallbackImages = [
    "https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&w=300&h=300", // Generic food
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&h=300", // Food closeup
    "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300", // Plate of food
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&h=300", // Colorful food
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&h=300"  // Vegetable dish
  ];
  
  // Use the first character of the item name as a simple hash to pick a consistent image
  const firstChar = (itemName || "").charAt(0).toLowerCase();
  const charCode = firstChar.charCodeAt(0) || 0;
  const index = charCode % fallbackImages.length;
  
  return fallbackImages[index];
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
