
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItems } from '@/hooks/restaurants/menu/useMenuItems';
import { useMenuItemSave } from '@/hooks/restaurants/menu/useMenuItemSave';
import { useMenuItemOperations } from '@/hooks/restaurants/menu/useMenuItemOperations';
import { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';

export interface Restaurant {
  id: string;
  name: string;
  user_id: string;
}

export const useRestaurantMenu = (restaurantId: string | undefined) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { menuItems, setMenuItems, isLoading: menuItemsLoading } = useMenuItems(restaurantId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setIsLoading(false);
        setError('Restaurant ID is required');
        return;
      }
      
      try {
        console.log('Fetching restaurant details for:', restaurantId);
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
          
        if (error) {
          console.error('Error fetching restaurant:', error);
          setError(error.message);
          return;
        }
        
        if (!data) {
          setError('Restaurant not found');
          return;
        }
        
        console.log('Restaurant data:', data);
        setRestaurant(data);
        
        // Check if user is owner
        setIsOwner(user?.id === data.user_id);
        
      } catch (err: any) {
        console.error('Error in fetchRestaurant:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurant();
  }, [restaurantId, user]);

  // Handle add new item
  const handleAddItem = () => {
    setCurrentItem({
      id: '',
      name: '',
      description: '',
      price: 0,
      type: 'Other',
      ingredients: [],
      media: []
    });
    setIsDialogOpen(true);
  };
  
  // Handle edit item
  const handleEditItem = (item: MenuItem) => {
    console.log('Editing item:', item);
    
    // Ensure we have the complete item data with media
    const fullItem = menuItems.find(mi => mi.id === item.id);
    
    if (fullItem) {
      console.log('Full item data for editing:', fullItem);
      setCurrentItem(fullItem);
    } else {
      console.log('Item not found in menuItems, using provided item');
      setCurrentItem(item);
    }
    
    setIsDialogOpen(true);
  };
  
  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!restaurantId) return;
    
    try {
      // Delete the menu item - the ingredients will be deleted via cascade
      const { error } = await supabase
        .from('restaurant_menu_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update the UI
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Item Deleted",
        description: "Menu item has been removed",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      
      toast({
        title: "Failed to Delete",
        description: "Could not remove the menu item. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Handle save item
  const handleSaveItem = async (item: MenuItemFormValues) => {
    if (!restaurantId || !user?.id) return;
    
    try {
      setIsSaving(true);
      
      const isNewItem = !currentItem || !currentItem.id;
      console.log('Saving menu item:', isNewItem ? 'new item' : 'update item', item);
      
      // Filter out empty ingredients
      const filteredIngredients = (item.ingredients || []).filter(ing => ing.trim() !== '');
      
      if (isNewItem) {
        // Create a new menu item
        const { data: newItem, error: createError } = await supabase
          .from('restaurant_menu_items')
          .insert({
            restaurant_id: restaurantId,
            name: item.name,
            description: item.description || null,
            price: item.price
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
          
          // Create the final menu item with all data
          const newMenuItem: MenuItem = {
            id: newItem.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            type: item.type || 'Other',
            ingredients: filteredIngredients,
            media: item.media || []
          };
          
          setMenuItems([...menuItems, newMenuItem]);
          
          toast({
            title: "Item Created",
            description: "New menu item has been created",
          });
        }
      } else if (currentItem) {
        // Update existing menu item
        const { error: updateError } = await supabase
          .from('restaurant_menu_items')
          .update({
            name: item.name,
            description: item.description || null,
            price: item.price
          })
          .eq('id', currentItem.id);
          
        if (updateError) throw updateError;
        
        // Delete and re-create ingredients
        const { error: deleteIngredientsError } = await supabase
          .from('restaurant_menu_ingredients')
          .delete()
          .eq('menu_item_id', currentItem.id);
          
        if (deleteIngredientsError) throw deleteIngredientsError;
        
        // Add new ingredients
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
        
        // Update UI
        setMenuItems(
          menuItems.map(item => 
            item.id === currentItem.id 
              ? { 
                  ...item, 
                  name: item.name, 
                  description: item.description || '', 
                  price: item.price, 
                  type: item.type || 'Other', 
                  ingredients: filteredIngredients,
                  media: item.media || []
                } 
              : item
          )
        );
        
        toast({
          title: "Item Updated",
          description: "Menu item has been updated",
        });
      }
      
      setIsDialogOpen(false);
      setCurrentItem(null);
      
      return true;
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save menu item",
        variant: "destructive",
      });
      return false;
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
    isLoading: isLoading || menuItemsLoading,
    isSaving,
    error,
    isOwner,
    isDialogOpen,
    currentItem,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleSaveItem,
    handleDialogClose
  };
};
