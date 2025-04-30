
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMemoryMedia = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();

  const uploadMedia = async (file: File, userId: string) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    try {
      setIsUploading(true);
      
      const { data, error } = await supabase.storage
        .from('memory_media')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('memory_media')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload media.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const deleteMedia = async (filePath: string) => {
    try {
      // Extract the path from the URL
      const url = new URL(filePath);
      const pathParts = url.pathname.split('/');
      const storagePath = pathParts.slice(pathParts.indexOf('memory_media') + 1).join('/');
      
      const { error } = await supabase.storage
        .from('memory_media')
        .remove([storagePath]);
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Delete Error',
        description: error.message || 'Failed to delete media.',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  return {
    uploadMedia,
    deleteMedia,
    isUploading
  };
};
