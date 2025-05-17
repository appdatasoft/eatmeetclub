
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/components/restaurants/menu/MenuItemMediaUploader";

/**
 * Fetches media items for a specific menu item from various possible storage paths
 */
export async function fetchMenuItemMedia(restaurantId: string, item: { id: string, name: string }): Promise<MediaItem[]> {
  try {
    const mediaPaths = [
      `menu-items/${restaurantId}/${item.id}`,
      `menu-items/${item.id}`
    ];
    
    // Check specific folders first
    for (const path of mediaPaths) {
      try {
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
            
            console.log(`Found ${media.length} files for ${item.name} in ${path}`);
            return media;
          }
        }
      } catch (error) {
        console.error(`Error checking path ${path}:`, error);
      }
    }
    
    // Check root menu-items directory for any matches with ID or name
    try {
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('lovable-uploads')
        .list('menu-items', { limit: 1000 });
        
      if (!rootError && rootFiles && rootFiles.length > 0) {
        const itemId = item.id.toLowerCase();
        const itemName = item.name.toLowerCase().replace(/\s+/g, '-');
        
        const matchingFiles = rootFiles.filter(file => 
          !file.name.endsWith('/') && (
            file.name.toLowerCase().includes(itemId) ||
            file.name.toLowerCase().includes(itemName) ||
            file.name.toLowerCase().includes(restaurantId.toLowerCase())
          )
        );
        
        if (matchingFiles.length > 0) {
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
          
          console.log(`Found ${media.length} matching files for ${item.name} in root directory`);
          return media;
        }
      }
    } catch (error) {
      console.error('Error checking root directory:', error);
    }
    
    // Use fallback static image only if no images found in storage
    console.log(`No media found for ${item.name}, using fallback image`);
    return [{
      url: getStaticFallbackImage(item.name),
      type: "image" as const
    }];
    
  } catch (error) {
    console.error('Error in fetchMenuItemMedia:', error);
    return [{
      url: getStaticFallbackImage(item.name),
      type: "image" as const
    }];
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
