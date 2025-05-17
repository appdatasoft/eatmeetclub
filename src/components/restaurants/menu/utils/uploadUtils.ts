
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "../types/mediaTypes";

/**
 * Uploads a file to Supabase storage
 */
export const uploadFileToStorage = async (
  file: File,
  restaurantId: string,
  menuItemId?: string
): Promise<MediaItem | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const isVideo = file.type.startsWith('video/');
    
    // Always use both restaurantId and menuItemId in the storage path to ensure proper organization
    const folderPath = menuItemId 
      ? `menu-items/${restaurantId}/${menuItemId}` 
      : `menu-items/${restaurantId}/temp`;
      
    console.log(`Using storage path: ${folderPath}`);
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folderPath}/${fileName}`;
    
    console.log('Uploading file:', file.name);
    console.log('Storage path:', filePath);
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('lovable-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('lovable-uploads')
      .getPublicUrl(filePath);
      
    if (publicUrlData && publicUrlData.publicUrl) {
      console.log('Public URL:', publicUrlData.publicUrl);
      
      // Store media info in database
      if (menuItemId) {
        const mediaType = isVideo ? 'video' : 'image';
        
        const { data: mediaRecord, error: mediaError } = await supabase
          .from('restaurant_menu_media')
          .insert({
            menu_item_id: menuItemId,
            restaurant_id: restaurantId,
            url: publicUrlData.publicUrl,
            storage_path: filePath,
            media_type: mediaType
          })
          .select('id')
          .single();
          
        if (mediaError) {
          console.error("Error storing media record:", mediaError);
          // Continue anyway, as we have the file uploaded
        } else {
          console.log("Media record stored with ID:", mediaRecord.id);
        }
      }
      
      return {
        url: publicUrlData.publicUrl,
        type: isVideo ? 'video' : 'image',
        id: filePath // Store the full path for easy deletion
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Deletes a file from Supabase storage
 */
export const deleteFileFromStorage = async (filePath: string): Promise<boolean> => {
  if (!filePath) {
    console.warn('No valid file path found for deletion');
    return false;
  }
  
  try {
    console.log(`Attempting to delete file: ${filePath}`);
    
    // First try to delete from the database
    try {
      const { data, error } = await supabase
        .from('restaurant_menu_media')
        .delete()
        .eq('storage_path', filePath);
        
      if (error) {
        console.error('Error deleting media record:', error);
        // Continue with file deletion anyway
      } else {
        console.log('Media record deleted successfully');
      }
    } catch (err) {
      console.error('Error checking media records:', err);
    }
    
    // Then delete the actual file
    const { error } = await supabase.storage
      .from('lovable-uploads')
      .remove([filePath]);
      
    if (error) {
      console.error('Error deleting file from storage:', error);
      return false;
    }
    
    console.log('File successfully deleted from storage');
    return true;
  } catch (err) {
    console.error('Error in delete operation:', err);
    return false;
  }
};

/**
 * Extract path from public URL
 */
export const extractPathFromUrl = (url: string): string | null => {
  try {
    // Extract the path portion from the URL
    const match = url.match(/\/storage\/v1\/object\/public\/lovable-uploads\/(.+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (err) {
    console.error('Error extracting path from URL:', err);
    return null;
  }
};
