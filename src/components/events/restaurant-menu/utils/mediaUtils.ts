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

    // Check if this is the doro-wot item
    if (item.name.toLowerCase().includes('doro') || 
        item.name.toLowerCase().includes('wot') || 
        item.id.toLowerCase().includes('doro')) {
      try {
        console.log('Found doro-wot item, fetching specific images from doro-wot folder');
        
        const { data: files, error } = await supabase
          .storage
          .from('lovable-uploads')
          .list('doro-wot');
          
        if (!error && files && files.length > 0) {
          const imageFiles = files.filter(file => !file.name.endsWith('/') && 
            (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')));
          
          if (imageFiles.length > 0) {
            console.log(`Found ${imageFiles.length} doro-wot images in storage`);
            
            const mediaItems = imageFiles.map(file => {
              const filePath = `doro-wot/${file.name}`;
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
            
            console.log('Successfully found doro-wot images:', mediaItems);
            return mediaItems;
          }
        }
      } catch (err) {
        console.error('Error fetching doro-wot specific images:', err);
      }
    }

    // Check if this is the rice item
    if (item.name.toLowerCase().includes('rice') || 
        item.id.toLowerCase().includes('rice')) {
      try {
        console.log('Found rice item, fetching specific images from rice folder');
        
        const { data: files, error } = await supabase
          .storage
          .from('lovable-uploads')
          .list('rice');
          
        if (!error && files && files.length > 0) {
          const imageFiles = files.filter(file => !file.name.endsWith('/') && 
            (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')));
          
          if (imageFiles.length > 0) {
            console.log(`Found ${imageFiles.length} rice images in storage`);
            
            const mediaItems = imageFiles.map(file => {
              const filePath = `rice/${file.name}`;
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
            
            console.log('Successfully found rice images:', mediaItems);
            return mediaItems;
          }
        }
      } catch (err) {
        console.error('Error fetching rice specific images:', err);
      }
    }
    
    // Main path - try the item's ID directly as a folder name
    const primaryPath = `${item.id}`;
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
              id: filePath
            };
          });
        }
      }
    } catch (error) {
      console.error(`Error checking primary path ${primaryPath}:`, error);
    }
    
    // Secondary path - try menu-items folder 
    const secondaryPath = `menu-items/${item.id}`;
    try {
      console.log(`Checking secondary path: ${secondaryPath}`);
      const { data: files, error } = await supabase.storage
        .from('lovable-uploads')
        .list(secondaryPath);
        
      if (!error && files && files.length > 0) {
        // Filter out directories and get valid media files
        const mediaFiles = files.filter(file => !file.name.endsWith('/'));
        
        if (mediaFiles.length > 0) {
          console.log(`Found ${mediaFiles.length} files in secondary path ${secondaryPath}`);
          
          return mediaFiles.map(file => {
            const filePath = `${secondaryPath}/${file.name}`;
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
      console.error(`Error checking secondary path ${secondaryPath}:`, error);
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
