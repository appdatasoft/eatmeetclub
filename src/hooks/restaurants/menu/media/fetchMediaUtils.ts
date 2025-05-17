
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from "@/components/restaurants/menu";
import { addCacheBuster, generateAlternativeUrls, findWorkingImageUrl, getDefaultFoodPlaceholder } from '@/utils/supabaseStorage';

/**
 * Fetches media items for a specific menu item from storage
 */
export const fetchMediaForMenuItem = async (restaurantId: string, itemId: string): Promise<MediaItem[]> => {
  let media: MediaItem[] = [];
  console.log(`Fetching media for menu item: ${itemId} in restaurant: ${restaurantId}`);
  
  // First, try direct food-named folders which is what we saw in storage
  const foodItems = ["rice", "doro-wot"];
  let mediaFound = false;
  
  for (const foodItem of foodItems) {
    if (itemId.toLowerCase().includes(foodItem.toLowerCase()) || 
        foodItem.toLowerCase().includes(itemId.toLowerCase())) {
      try {
        console.log(`Checking direct folder for ${foodItem}`);
        const { data: files, error } = await supabase
          .storage
          .from('lovable-uploads')
          .list(foodItem);
          
        if (!error && files && files.length > 0) {
          const imageFiles = files.filter(file => !file.name.endsWith('/'));
          
          if (imageFiles.length > 0) {
            console.log(`Found ${imageFiles.length} files in direct folder ${foodItem}`);
            
            const mediaItems = imageFiles.map(file => {
              const filePath = `${foodItem}/${file.name}`;
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
        }
      } catch (err) {
        console.error(`Error accessing direct folder ${foodItem}:`, err);
      }
    }
  }
  
  // Paths to check, in order of priority
  const pathsToCheck = [
    // 1. Item-specific (most likely location)
    `menu-items/${itemId}`,
    // 2. Restaurant & item specific 
    `menu-items/${restaurantId}/${itemId}`,
    // 3. Just the item ID as a root folder
    `${itemId}`,
    // 4. Restaurant folder (might contain item-specific files)
    `menu-items/${restaurantId}`
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
  
  // Try direct file URLs as a fallback approach
  try {
    // Find a working image URL
    const workingUrl = await findWorkingImageUrl(restaurantId, itemId);
    
    if (workingUrl) {
      console.log(`Found working direct URL for item ${itemId}:`, workingUrl);
      
      return [{
        url: workingUrl,
        type: 'image',
        id: workingUrl.split('?')[0] // Store the URL without query params as ID
      }];
    }
  } catch (err) {
    console.error('Error in fallback URL check:', err);
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
