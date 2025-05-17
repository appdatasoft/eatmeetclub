
import { supabase } from '@/integrations/supabase/client';
import { MediaOperationResult } from './types';

/**
 * Deletes a media item
 */
export const deleteMediaItem = async (filePath: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete file: ${filePath}`);
    
    // Ensure the file path is valid
    if (!filePath || filePath.trim() === '') {
      console.error('Invalid file path provided for deletion');
      return false;
    }
    
    const { data, error } = await supabase
      .storage
      .from('lovable-uploads')
      .remove([filePath]);
      
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    console.log('File deleted successfully:', filePath);
    return true;
  } catch (err) {
    console.error('Error in deleteMediaItem:', err);
    return false;
  }
};
