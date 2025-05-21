
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageContent = (pagePath: string, defaultImages: Record<string, string>) => {
  const [images, setImages] = useState<Record<string, string>>(defaultImages);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare the element_ids to search for
        const imageIds = Object.keys(defaultImages);
        
        if (imageIds.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Fetch images from the database with retry logic
        const fetchWithRetry = async (attempts: number = 3): Promise<any> => {
          try {
            const { data, error } = await supabase
              .from('page_content')
              .select('element_id, content')
              .eq('page_path', pagePath)
              .eq('content_type', 'image')
              .in('element_id', imageIds);
            
            if (error) throw error;
            return data;
          } catch (err) {
            if (attempts > 1) {
              console.log(`Retrying image fetch, ${attempts - 1} attempts left`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return fetchWithRetry(attempts - 1);
            }
            throw err;
          }
        };
        
        const data = await fetchWithRetry();
        
        // Update the images state with the fetched data
        const fetchedImages: Record<string, string> = { ...defaultImages };
        
        if (data && Array.isArray(data)) {
          data.forEach(item => {
            if (item && item.element_id && item.content) {
              fetchedImages[item.element_id] = item.content;
            }
          });
        }
        
        setImages(fetchedImages);
      } catch (error: any) {
        console.error('Error fetching images:', error);
        setError(error.message || 'Failed to fetch images');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImages();
  }, [pagePath, defaultImages]);
  
  return { images, isLoading, error, setImages };
};

export default useImageContent;
