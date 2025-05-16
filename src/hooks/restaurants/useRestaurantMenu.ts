
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';
import { MediaItem } from '@/components/restaurants/menu/MenuItemMediaUploader';

export const useRestaurantMenu = (restaurantId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch restaurant details and menu items
  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId || !user) return;

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
        setIsOwner(restaurantData.user_id === user.id);
        
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
            // First check if 'restaurant_menu_media' table exists by using RPC
            let mediaItems: MediaItem[] = [];
            try {
              // Try the RPC method first (if it exists)
              const { data: mediaData } = await supabase.rpc('get_menu_item_media', {
                item_id: item.id
              });
              
              if (mediaData && mediaData.length > 0) {
                mediaItems = mediaData as MediaItem[];
              }
            } catch (err) {
              console.log('RPC not available, using storage query instead');
              
              // Fallback: try to get the media directly from storage
              try {
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
            }
            
            // Transform to match our MenuItem interface
            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: item.type || '',
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
  }, [restaurantId, user, toast]);

  // Handle menu item actions (add, edit, delete, save)
  const handleAddItem = () => {
    setCurrentItem(null);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setCurrentItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      // Delete the menu item - the ingredients and media items will be deleted via cascade
      const { error } = await supabase
        .from('restaurant_menu_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update the UI
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete menu item',
        variant: 'destructive'
      });
    }
  };

  const handleSaveItem = async (values: MenuItemFormValues) => {
    if (!restaurantId || !user) return;
    
    try {
      setIsSaving(true);
      
      // Filter out empty ingredients
      const filteredIngredients = (values.ingredients || []).filter(ing => ing.trim() !== '');
      
      // If we're editing an existing item
      if (currentItem) {
        try {
          // Update the menu item
          const { error: updateError } = await supabase
            .from('restaurant_menu_items')
            .update({
              name: values.name,
              description: values.description,
              price: values.price,
              type: values.type
            })
            .eq('id', currentItem.id);
          
          if (updateError) throw updateError;
          
          // First delete all existing ingredients
          const { error: deleteIngredientsError } = await supabase
            .from('restaurant_menu_ingredients')
            .delete()
            .eq('menu_item_id', currentItem.id);
            
          if (deleteIngredientsError) throw deleteIngredientsError;
          
          // Then add the new ingredients
          if (filteredIngredients.length > 0) {
            const ingredientsToInsert = filteredIngredients.map(name => ({
              menu_item_id: currentItem.id,
              name,
              restaurant_id: restaurantId
            }));
            
            const { error: insertIngredientsError } = await supabase
              .from('restaurant_menu_ingredients')
              .insert(ingredientsToInsert);
              
            if (insertIngredientsError) throw insertIngredientsError;
          }

          // Handle media items - here we use direct file storage instead of a table
          if (values.media && values.media.length > 0) {
            // We're storing media info directly in Storage
            // No need to delete existing files as they will be overwritten with the same paths
            
            // Update the UI
            setMenuItems(prev => 
              prev.map(item => 
                item.id === currentItem.id 
                  ? { 
                      ...item, 
                      name: values.name, 
                      description: values.description || '', 
                      price: values.price, 
                      type: values.type, 
                      ingredients: filteredIngredients,
                      media: values.media
                    } 
                  : item
              )
            );
          }
        } catch (error: any) {
          console.error('Error updating menu item:', error);
          throw error;
        }
      } else {
        try {
          // Create a new menu item
          const { data: newItem, error: createError } = await supabase
            .from('restaurant_menu_items')
            .insert({
              restaurant_id: restaurantId,
              name: values.name,
              description: values.description || null,
              price: values.price,
              type: values.type
            })
            .select()
            .single();
            
          if (createError) throw createError;
          
          if (newItem) {
            // Insert ingredients
            if (filteredIngredients.length > 0) {
              const ingredientsToInsert = filteredIngredients.map(name => ({
                menu_item_id: newItem.id,
                name,
                restaurant_id: restaurantId
              }));
              
              const { error: insertIngredientsError } = await supabase
                .from('restaurant_menu_ingredients')
                .insert(ingredientsToInsert);
                
              if (insertIngredientsError) throw insertIngredientsError;
            }

            // Handle media items - using storage approach
            // the actual files are already uploaded by the MenuItemMediaUploader
            // component, we just need to update our UI state
            
            // Update the UI
            const newMenuItem: MenuItem = {
              id: newItem.id,
              name: values.name,
              description: values.description || '',
              price: values.price,
              type: values.type,
              ingredients: filteredIngredients,
              media: values.media
            };
            
            setMenuItems(prev => [...prev, newMenuItem]);
          }
        } catch (error: any) {
          console.error('Error creating menu item:', error);
          throw error;
        }
      }
      
      toast({
        title: 'Success',
        description: `Menu item ${currentItem ? 'updated' : 'created'} successfully`,
      });
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${currentItem ? 'update' : 'create'} menu item`,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentItem(null);
  };

  return {
    restaurant,
    menuItems,
    isLoading,
    isSaving,
    isDialogOpen,
    currentItem,
    isOwner,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleSaveItem,
    handleDialogClose
  };
};
