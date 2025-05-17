
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

    // Check common food items with known direct folders
    const commonFoodItems = [
      {name: "doro-wot", keywords: ["doro", "wot"]},
      {name: "rice", keywords: ["rice"]},
      {name: "injera", keywords: ["injera"]},
      {name: "tibs", keywords: ["tibs"]},
      {name: "kitfo", keywords: ["kitfo"]},
      {name: "misir", keywords: ["misir"]}
    ];
    
    // Check if this item matches any common food item
    const matchedFoodItem = commonFoodItems.find(food => 
      food.keywords.some(keyword => 
        item.name.toLowerCase().includes(keyword.toLowerCase()) || 
        item.id.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    if (matchedFoodItem) {
      const folderName = matchedFoodItem.name;
      try {
        console.log(`Found potential match for ${item.name}, checking ${folderName} folder`);
        
        const { data: files, error } = await supabase
          .storage
          .from('lovable-uploads')
          .list(folderName);
          
        if (!error && files && files.length > 0) {
          const imageFiles = files.filter(file => !file.name.endsWith('/') && 
            (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')));
          
          if (imageFiles.length > 0) {
            console.log(`Found ${imageFiles.length} images in ${folderName} folder`);
            
            const mediaItems = imageFiles.map(file => {
              const filePath = `${folderName}/${file.name}`;
              const publicUrl = supabase.storage
                .from('lovable-uploads')
                .getPublicUrl(filePath).data.publicUrl;
                
              // Add cache buster parameter to the URL
              const urlWithCache = addCacheBuster(publicUrl);
              
              return {
                url: urlWithCache,
                type: 'image' as const,
                id: filePath
              };
            });
            
            console.log(`Successfully found ${folderName} images:`, mediaItems);
            return mediaItems;
          }
        }
      } catch (err) {
        console.error(`Error fetching ${folderName} specific images:`, err);
      }
    }
    
    // Try multiple possible paths in order of priority
    const pathsToTry = [
      `${item.id}`, // Direct folder with item ID
      `menu-items/${item.id}`, // Menu items subfolder
      `menu-items/${restaurantId}/${item.id}`, // Restaurant specific menu item
      `restaurants/${restaurantId}/menu/${item.id}` // Alternative structure
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
    
    // Try to find a working image URL as fallback
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
