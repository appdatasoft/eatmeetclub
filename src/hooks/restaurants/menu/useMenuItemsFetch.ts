
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { MediaItem } from '@/components/restaurants/menu/MenuItemMediaUploader';

export const useMenuItemsFetch = (restaurantId: string | undefined, userId: string | undefined) => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId || !userId) return;

      try {
        setIsLoading(true);
        
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
          
        if (restaurantError) throw restaurantError;
        
        setRestaurant(restaurantData);
        
        // Check if user is the owner of the restaurant
        setIsOwner(restaurantData.user_id === userId);
        
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);
          
        if (menuError) throw menuError;
        
        if (menuData) {
          // For each menu item, fetch its ingredients and media items
          const itemsWithDetails = await Promise.all(menuData.map(async (item) => {
            // Fetch ingredients for this menu item
            const { data: ingredientsData, error: ingredientsError } = await supabase
              .from('restaurant_menu_ingredients')
              .select('name')
              .eq('menu_item_id', item.id);
              
            if (ingredientsError) throw ingredientsError;
            
            // Try to get the media items associated with this menu item
            let mediaItems: MediaItem[] = [];
            try {
              // Try to get media directly from storage
              const { data: storageData } = await supabase
                .storage
                .from('lovable-uploads')
                .list(`menu-items/${restaurantId}/${item.id}`);
                
              if (storageData && storageData.length > 0) {
                mediaItems = storageData.map(file => {
                  const publicUrl = supabase.storage
                    .from('lovable-uploads')
                    .getPublicUrl(`menu-items/${restaurantId}/${item.id}/${file.name}`).data.publicUrl;
                    
                  return {
                    url: publicUrl,
                    type: file.metadata?.mimetype?.startsWith('video/') ? 'video' : 'image'
                  };
                });
              }
            } catch (storageErr) {
              console.error('Error accessing storage:', storageErr);
            }
            
            // Transform to match our MenuItem interface
            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: '', // Set a default empty string since type doesn't exist in the database
              ingredients: ingredientsData ? ingredientsData.map(ing => ing.name) : [],
              media: mediaItems
            } as MenuItem;
          }));
          
          setMenuItems(itemsWithDetails);
        }
      } catch (error: any) {
        console.error('Error fetching restaurant menu:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load restaurant menu',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [restaurantId, userId, toast]);

  return { restaurant, menuItems, isLoading, isOwner, setMenuItems };
};
