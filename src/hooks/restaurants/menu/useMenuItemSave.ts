
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';

export const useMenuItemSave = {
  // Create a new menu item
  createMenuItem: async (
    restaurantId: string,
    item: MenuItemFormValues,
    filteredIngredients: string[],
    menuItems: MenuItem[],
    setMenuItems: (items: MenuItem[]) => void,
    toast: any
  ) => {
    try {
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
        
        return true;
      }
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      throw error;
    }
    return false;
  },
  
  // Update an existing menu item
  updateMenuItem: async (
    restaurantId: string,
    itemId: string,
    item: MenuItemFormValues,
    filteredIngredients: string[],
    menuItems: MenuItem[],
    setMenuItems: (items: MenuItem[]) => void,
    toast: any
  ) => {
    try {
      // Update existing menu item
      const { error: updateError } = await supabase
        .from('restaurant_menu_items')
        .update({
          name: item.name,
          description: item.description || null,
          price: item.price
        })
        .eq('id', itemId);
        
      if (updateError) throw updateError;
      
      // Delete and re-create ingredients
      const { error: deleteIngredientsError } = await supabase
        .from('restaurant_menu_ingredients')
        .delete()
        .eq('menu_item_id', itemId);
        
      if (deleteIngredientsError) throw deleteIngredientsError;
      
      // Add new ingredients
      if (filteredIngredients.length > 0) {
        const ingredientsToInsert = filteredIngredients.map(name => ({
          menu_item_id: itemId,
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
        menuItems.map(menuItem => 
          menuItem.id === itemId 
            ? { 
                ...menuItem, 
                name: item.name, 
                description: item.description || '', 
                price: item.price, 
                type: item.type || 'Other', 
                ingredients: filteredIngredients,
                media: item.media || []
              } 
            : menuItem
        )
      );
      
      toast({
        title: "Item Updated",
        description: "Menu item has been updated",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      throw error;
    }
    return false;
  }
};
