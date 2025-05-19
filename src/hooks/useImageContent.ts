
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageContent = (pagePath: string, defaultImages: Record<string, string>) => {
  const [images, setImages] = useState<Record<string, string>>(defaultImages);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        
        // Prepare the element_ids to search for
        const imageIds = Object.keys(defaultImages);
        
        if (imageIds.length === 0) return;
        
        // Fetch images from the database
        const { data, error } = await supabase
          .from('page_content')
          .select('element_id, content')
          .eq('page_path', pagePath)
          .eq('content_type', 'image')
          .in('element_id', imageIds);
        
        if (error) throw error;
        
        // Update the images state with the fetched data
        const fetchedImages: Record<string, string> = { ...defaultImages };
        
        if (data) {
          data.forEach(item => {
            fetchedImages[item.element_id] = item.content;
          });
        }
        
        setImages(fetchedImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImages();
  }, [pagePath]);
  
  return { images, isLoading, setImages };
};
