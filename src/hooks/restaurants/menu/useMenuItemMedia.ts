
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/components/restaurants/menu/MenuItemMediaUploader';

export const useMenuItemMedia = () => {
  const fetchMediaForMenuItem = async (restaurantId: string, itemId: string): Promise<MediaItem[]> => {
    try {
      // Try to get media directly from storage
      const { data: storageData } = await supabase
        .storage
        .from('lovable-uploads')
        .list(`menu-items/${restaurantId}/${itemId}`);
        
      if (storageData && storageData.length > 0) {
        return storageData.map(file => {
          const publicUrl = supabase.storage
            .from('lovable-uploads')
            .getPublicUrl(`menu-items/${restaurantId}/${itemId}/${file.name}`).data.publicUrl;
            
          return {
            url: publicUrl,
            type: file.metadata?.mimetype?.startsWith('video/') ? 'video' : 'image'
          };
        });
      }
      
      // If no media found in specific path, try to search in root menu-items directory
      const { data: listData, error: listError } = await supabase
        .storage
        .from('lovable-uploads')
        .list('menu-items', { limit: 1000 });
      
      if (listError) {
        console.error('Error accessing storage:', listError);
        return [];
      }
      
      if (listData && listData.length > 0) {
        const matchingFiles = listData.filter(file => 
          file.name.toLowerCase().includes(itemId)
        );
        
        if (matchingFiles.length > 0) {
          return matchingFiles.map(file => {
            const publicUrl = supabase.storage
              .from('lovable-uploads')
              .getPublicUrl(`menu-items/${file.name}`).data.publicUrl;
              
            const isVideo = file.name.match(/\.(mp4|webm|mov)$/i) !== null;
            
            return {
              url: publicUrl,
              type: isVideo ? 'video' : 'image'
            };
          });
        }
      }
      
      return [];
    } catch (storageErr) {
      console.error('Error accessing storage:', storageErr);
      return [];
    }
  };

  const fetchIngredientsForMenuItem = async (itemId: string): Promise<string[]> => {
    try {
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('restaurant_menu_ingredients')
        .select('name')
        .eq('menu_item_id', itemId);
        
      if (ingredientsError) {
        console.error('Error fetching ingredients:', ingredientsError);
        return [];
      }
      
      return ingredientsData ? ingredientsData.map(ing => ing.name) : [];
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return [];
    }
  };

  return { fetchMediaForMenuItem, fetchIngredientsForMenuItem };
};
