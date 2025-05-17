
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from "@/components/restaurants/menu";
import { addCacheBuster, generateAlternativeUrls } from '@/utils/supabaseStorage';

/**
 * Fetches media items for a specific menu item from storage
 */
export const fetchMediaForMenuItem = async (restaurantId: string, itemId: string): Promise<MediaItem[]> => {
  let media: MediaItem[] = [];
  console.log(`Fetching media for menu item: ${itemId} in restaurant: ${restaurantId}`);
  
  // Paths to check, in order of priority
  const pathsToCheck = [
    // 1. Restaurant & item specific (most precise)
    `menu-items/${restaurantId}/${itemId}`,
    // 2. Item name-based paths
    `menu-items/${itemId}`,
    // 3. Root folder paths with item prefix
    `menu-items`,
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
        
        // Match based on item ID in filename
        const matchesId = file.name.includes(itemId);
        
        // Include all files in item-specific directories
        const isInItemDir = path.includes(itemId);
        
        return matchesId || isInItemDir || path === `menu-items/${restaurantId}/${itemId}`;
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
    // Generate a list of possible URLs to try
    const alternativeUrls = generateAlternativeUrls(restaurantId, itemId);
    console.log(`Trying ${alternativeUrls.length} alternative URL patterns for item ${itemId}`);
    
    // Check each URL with a HEAD request 
    // (this approach is more efficient than actually trying to render the images)
    const urlChecks = alternativeUrls.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          return url;
        }
        return null;
      } catch (_) {
        return null;
      }
    });
    
    // Wait for all HEAD requests to complete
    const validUrls = (await Promise.all(urlChecks)).filter(Boolean) as string[];
    
    if (validUrls.length > 0) {
      console.log(`Found ${validUrls.length} valid direct URL(s) for item ${itemId}:`, validUrls[0]);
      
      return validUrls.map(url => ({
        url,
        type: 'image',
        id: url.split('?')[0] // Store the URL without query params as ID
      }));
    }
  } catch (err) {
    console.error('Error in fallback URL check:', err);
  }
  
  // Return empty array if no media found
  console.log(`No media found for menu item ${itemId}`);
  return [];
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
