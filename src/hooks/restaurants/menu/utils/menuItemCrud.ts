
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/menuItem';
import { MenuItemFormValues } from '@/components/restaurants/menu/types/menuTypes';

/**
 * Creates a new menu item in the database
 */
export const createMenuItem = async (
  restaurantId: string,
  formData: MenuItemFormValues,
  filteredIngredients: string[],
  menuItems: MenuItem[],
  setMenuItems: (items: MenuItem[]) => void,
  toast: any
): Promise<boolean> => {
  try {
    // Prepare the item data
    const itemData = {
      name: formData.name,
      description: formData.description || '',
      price: formData.price,
      restaurant_id: restaurantId,
      type: formData.type || 'Other' // Ensure type is always set
    };
    
    // Create new item
    const { data: newItem, error: insertError } = await supabase
      .from('restaurant_menu_items')
      .insert(itemData)
      .select()
      .single();
      
    if (insertError) throw insertError;
    const savedItemId = newItem.id;
    
    // Add ingredients if any
    if (filteredIngredients.length > 0) {
      const ingredientsData = filteredIngredients.map(ing => ({
        menu_item_id: savedItemId,
        restaurant_id: restaurantId,
        name: ing
      }));
      
      const { error: ingredientsError } = await supabase
        .from('restaurant_menu_ingredients')
        .insert(ingredientsData);
        
      if (ingredientsError) throw ingredientsError;
    }
    
    // Update the UI
    const newMenuItem: MenuItem = {
      id: savedItemId,
      name: formData.name,
      description: formData.description || '',
      price: formData.price,
      restaurant_id: restaurantId,
      type: formData.type || 'Other',
      ingredients: filteredIngredients,
      media: formData.media || []
    };
    
    setMenuItems([...menuItems, newMenuItem]);
    
    toast({
      title: "Item Added",
      description: "Menu item has been added successfully",
    });
    
    return true;
  } catch (err: any) {
    console.error('Error creating menu item:', err);
    toast({
      title: "Save Failed",
      description: err.message || "Could not save menu item",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Updates an existing menu item in the database
 */
export const updateMenuItem = async (
  restaurantId: string,
  itemId: string,
  formData: MenuItemFormValues,
  filteredIngredients: string[],
  menuItems: MenuItem[],
  setMenuItems: (items: MenuItem[]) => void,
  toast: any
): Promise<boolean> => {
  try {
    // Prepare the item data
    const itemData = {
      name: formData.name,
      description: formData.description || '',
      price: formData.price,
      restaurant_id: restaurantId,
      type: formData.type || 'Other' // Ensure type is always set
    };
    
    // Update existing item
    const { error: updateError } = await supabase
      .from('restaurant_menu_items')
      .update(itemData)
      .eq('id', itemId)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    // Process ingredients - first delete existing
    const { error: deleteIngredientsError } = await supabase
      .from('restaurant_menu_ingredients')
      .delete()
      .eq('menu_item_id', itemId);
      
    if (deleteIngredientsError) throw deleteIngredientsError;
    
    // Add ingredients if any
    if (filteredIngredients.length > 0) {
      const ingredientsData = filteredIngredients.map(ing => ({
        menu_item_id: itemId,
        restaurant_id: restaurantId,
        name: ing
      }));
      
      const { error: ingredientsError } = await supabase
        .from('restaurant_menu_ingredients')
        .insert(ingredientsData);
        
      if (ingredientsError) throw ingredientsError;
    }
    
    // Update the UI
    setMenuItems(
      menuItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              name: formData.name, 
              description: formData.description || '', 
              price: formData.price, 
              type: formData.type || 'Other',
              ingredients: filteredIngredients,
              media: formData.media || [] 
            } 
          : item
      )
    );
    
    toast({
      title: "Item Updated",
      description: "Menu item has been updated successfully",
    });
    
    return true;
  } catch (err: any) {
    console.error('Error updating menu item:', err);
    toast({
      title: "Update Failed",
      description: err.message || "Could not update menu item",
      variant: "destructive",
    });
    return false;
  }
};
