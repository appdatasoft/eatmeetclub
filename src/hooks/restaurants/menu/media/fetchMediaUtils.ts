
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from "@/components/restaurants/menu";

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
  
  // Additional logging to help debug
  console.log(`Looking for media in these paths: ${pathsToCheck.join(', ')}`);
  
  // Try each path until we find media
  for (const path of pathsToCheck) {
    try {
      console.log(`Checking path: ${path}`);
      
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
      
      console.log(`Found ${files.length} files in ${path}:`, files.map(f => f.name).join(', '));
      
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
        console.log(`Found ${relevantFiles.length} relevant files for item ${itemId} in path ${path}`);
        
        // Map files to MediaItems
        const mediaItems = relevantFiles.map(file => {
          const filePath = `${path}/${file.name}`;
          const publicUrl = supabase.storage
            .from('lovable-uploads')
            .getPublicUrl(filePath).data.publicUrl;
            
          const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
          
          console.log(`Generated URL for ${filePath}: ${publicUrl}`);
          
          return {
            url: publicUrl,
            type: isVideo ? 'video' as const : 'image' as const,
            id: filePath // Store full path for deletion capabilities
          };
        });
        
        if (mediaItems.length > 0) {
          console.log(`Successfully mapped ${mediaItems.length} media items from ${path}`);
          return mediaItems;
        }
      }
    } catch (err) {
      console.error(`Error accessing storage path ${path}:`, err);
    }
  }
  
  // If we reach here, we need to directly check all files in the bucket
  try {
    console.log("Attempting to search entire storage bucket for any files related to this item");
    
    const { data: rootFiles, error: rootError } = await supabase
      .storage
      .from('lovable-uploads')
      .list();
      
    if (!rootError && rootFiles && rootFiles.length > 0) {
      console.log(`Found ${rootFiles.length} files at root level of storage`);
      
      // Look for item ID or restaurant ID in any file names
      const possibleMatches = rootFiles.filter(file => 
        file.name.includes(itemId) || 
        (file.name.includes(restaurantId) && !file.name.endsWith('/'))
      );
      
      if (possibleMatches.length > 0) {
        console.log(`Found ${possibleMatches.length} possible matching files at root level`);
        
        const mediaItems = possibleMatches.map(file => {
          const filePath = file.name;
          const publicUrl = supabase.storage
            .from('lovable-uploads')
            .getPublicUrl(filePath).data.publicUrl;
            
          const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
          
          return {
            url: publicUrl,
            type: isVideo ? 'video' as const : 'image' as const,
            id: filePath
          };
        });
        
        if (mediaItems.length > 0) {
          console.log(`Found ${mediaItems.length} media items at root level`);
          return mediaItems;
        }
      }
    }
  } catch (err) {
    console.error('Error in root level storage search:', err);
  }
  
  // Last resort - try direct access if we know the filename pattern
  try {
    console.log("Trying direct file access as last resort");
    
    // Test common naming patterns
    const testPaths = [
      `${itemId}.jpg`,
      `${itemId}.png`,
      `${itemId}.jpeg`,
      `menu-item-${itemId}.jpg`,
      `${restaurantId}-${itemId}.jpg`
    ];
    
    for (const testPath of testPaths) {
      const { data: fileExists } = await supabase
        .storage
        .from('lovable-uploads')
        .getPublicUrl(testPath);
        
      if (fileExists) {
        console.log(`Direct file access successful for ${testPath}`);
        return [{
          url: fileExists.publicUrl,
          type: 'image',
          id: testPath
        }];
      }
    }
  } catch (err) {
    console.error('Error in direct file access attempt:', err);
  }
  
  // Return empty array if no media found
  console.log(`No media found for item ${itemId} after all attempts, returning empty array`);
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
      console.error(`Error fetching ingredients for item ${itemId}:`, ingredientsError);
      return [];
    }
    
    return ingredientsData ? ingredientsData.map(ing => ing.name) : [];
  } catch (err) {
    console.error(`Error in fetchIngredientsForMenuItem for item ${itemId}:`, err);
    return [];
  }
};
