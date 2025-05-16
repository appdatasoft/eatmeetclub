
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';

// Define custom types to work with the new tables
type RestaurantMenuItem = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  created_at: string;
  updated_at: string;
  ingredients?: { name: string }[];
}

type MenuIngredient = {
  id: string;
  menu_item_id: string;
  restaurant_id: string;
  name: string;
  created_at: string;
}

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
        
        // Fetch menu items using custom typing
        const { data: menuData, error: menuError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId) as { data: RestaurantMenuItem[] | null; error: any };
          
        if (menuError) throw menuError;
        
        if (menuData) {
          // For each menu item, fetch its ingredients
          const itemsWithIngredients = await Promise.all(menuData.map(async (item) => {
            // Fetch ingredients for this menu item
            const { data: ingredientsData, error: ingredientsError } = await supabase
              .from('restaurant_menu_ingredients')
              .select('name')
              .eq('menu_item_id', item.id) as { data: { name: string }[] | null; error: any };
              
            if (ingredientsError) throw ingredientsError;
            
            // Transform to match our MenuItem interface
            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: item.type || '',
              ingredients: ingredientsData ? ingredientsData.map(ing => ing.name) : []
            } as MenuItem;
          }));
          
          setMenuItems(itemsWithIngredients);
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
      // Delete the menu item - the ingredients will be deleted via cascade
      const { error } = await supabase
        .from('restaurant_menu_items')
        .delete()
        .eq('id', itemId) as { error: any };
        
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
      const filteredIngredients = values.ingredients.filter(ing => ing.trim() !== '');
      
      // If we're editing an existing item
      if (currentItem) {
        // Update the menu item
        const { error: updateError } = await supabase
          .from('restaurant_menu_items')
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            type: values.type
          })
          .eq('id', currentItem.id) as { error: any };
          
        if (updateError) throw updateError;
        
        // First delete all existing ingredients
        const { error: deleteIngredientsError } = await supabase
          .from('restaurant_menu_ingredients')
          .delete()
          .eq('menu_item_id', currentItem.id) as { error: any };
          
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
            .insert(ingredientsToInsert) as { error: any };
            
          if (insertIngredientsError) throw insertIngredientsError;
        }
        
        // Update the UI
        setMenuItems(prev => 
          prev.map(item => 
            item.id === currentItem.id 
              ? { ...item, ...values, ingredients: filteredIngredients } 
              : item
          )
        );
      } else {
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
          .single() as { data: RestaurantMenuItem | null; error: any };
          
        if (createError) throw createError;
        
        if (newItem && filteredIngredients.length > 0) {
          const ingredientsToInsert = filteredIngredients.map(name => ({
            menu_item_id: newItem.id,
            name,
            restaurant_id: restaurantId
          }));
          
          const { error: insertIngredientsError } = await supabase
            .from('restaurant_menu_ingredients')
            .insert(ingredientsToInsert) as { error: any };
            
          if (insertIngredientsError) throw insertIngredientsError;
        }
        
        if (newItem) {
          // Update the UI
          const newMenuItem: MenuItem = {
            id: newItem.id,
            name: values.name,
            description: values.description || '',
            price: values.price,
            type: values.type,
            ingredients: filteredIngredients
          };
          
          setMenuItems(prev => [...prev, newMenuItem]);
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
