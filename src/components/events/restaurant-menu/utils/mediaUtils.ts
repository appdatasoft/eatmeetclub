
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/components/restaurants/menu/MenuItemMediaUploader";

/**
 * Fetches media items for a specific menu item from various possible storage paths
 */
export async function fetchMenuItemMedia(restaurantId: string, item: { id: string, name: string }): Promise<MediaItem[]> {
  try {
    console.log(`Fetching media for item ${item.name} (${item.id}) in restaurant ${restaurantId}`);
    const mediaPaths = [
      `menu-items/${restaurantId}/${item.id}`,
      `menu-items/${item.id}`,
      `menu-items/${restaurantId}`
    ];
    
    // Check for direct file matches in menu-items directory
    try {
      console.log(`Looking for direct matches in menu-items for item ${item.id}`);
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('lovable-uploads')
        .list('menu-items');
        
      if (!rootError && rootFiles && rootFiles.length > 0) {
        console.log(`Found ${rootFiles.length} files in root menu-items directory`);
        
        // Look for files containing the item ID or restaurant ID
        const itemId = item.id.toLowerCase();
        const matchingFiles = rootFiles.filter(file => 
          !file.name.endsWith('/') && (
            file.name.toLowerCase().includes(itemId) ||
            (item.name && file.name.toLowerCase().includes(item.name.toLowerCase().replace(/\s+/g, '-')))
          )
        );
        
        if (matchingFiles.length > 0) {
          console.log(`Found ${matchingFiles.length} matching files in root directory`);
          const media = matchingFiles.map(file => {
            const filePath = `menu-items/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
              
            // Fixed type issue by ensuring it's explicitly "video" or "image"
            const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
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
      console.error('Error checking root directory:', error);
    }
    
    // Check specific folders
    for (const path of mediaPaths) {
      try {
        console.log(`Checking path: ${path}`);
        const { data: files, error } = await supabase.storage
          .from('lovable-uploads')
          .list(path);
          
        if (error) {
          console.log(`No files found in path: ${path}`);
          continue;
        }
        
        if (files && files.length > 0) {
          // Filter out directories
          const mediaFiles = files.filter(file => !file.name.endsWith('/'));
          
          if (mediaFiles.length > 0) {
            console.log(`Found ${mediaFiles.length} files in ${path}`);
            const media = mediaFiles.map(file => {
              const filePath = `${path}/${file.name}`;
              const publicUrl = supabase.storage
                .from('lovable-uploads')
                .getPublicUrl(filePath).data.publicUrl;
                
              // Fixed type issue by ensuring it's explicitly "video" or "image"
              const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
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
        console.error(`Error checking path ${path}:`, error);
      }
    }
    
    // Check restaurant directory directly as a fallback
    try {
      const restaurantPath = `menu-items/${restaurantId}`;
      console.log(`Checking restaurant path: ${restaurantPath}`);
      
      const { data: restaurantFiles, error: restaurantError } = await supabase.storage
        .from('lovable-uploads')
        .list(restaurantPath);
        
      if (!restaurantError && restaurantFiles && restaurantFiles.length > 0) {
        const mediaFiles = restaurantFiles.filter(file => !file.name.endsWith('/'));
        
        if (mediaFiles.length > 0) {
          console.log(`Found ${mediaFiles.length} files in restaurant directory`);
          const media = mediaFiles.map(file => {
            const filePath = `${restaurantPath}/${file.name}`;
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(filePath).data.publicUrl;
              
            // Fixed type issue by ensuring it's explicitly "video" or "image"
            const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
            const fileType: "video" | "image" = isVideo ? "video" : "image";
            
            return {
              url: publicUrl,
              type: fileType
            };
          });
          
          // If we found files in the restaurant directory, just return the first few
          // as generic item images
          return media.slice(0, 3);
        }
      }
    } catch (error) {
      console.error('Error checking restaurant directory:', error);
    }
    
    // If all methods failed, return empty array instead of fallback
    console.log(`No media found for ${item.name}`);
    return [];
    
  } catch (error) {
    console.error('Error in fetchMenuItemMedia:', error);
    return [];
  }
}

/**
 * Returns a static fallback image URL based on the item name
 */
function getStaticFallbackImage(itemName: string): string {
  // Array of reliable, pre-cached food images from Unsplash
  const fallbackImages = [
    "https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&w=300&h=300",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&h=300",
    "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=300&h=300"
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
