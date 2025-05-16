
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';

export const useMenuItemSave = (
  restaurantId: string | undefined, 
  userId: string | undefined,
  menuItems: MenuItem[],
  setMenuItems: (items: MenuItem[]) => void,
  currentItem: MenuItem | null,
  setIsDialogOpen: (isOpen: boolean) => void
) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveItem = async (values: MenuItemFormValues) => {
    if (!restaurantId || !userId) return;
    
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

          // Update the UI
          setMenuItems(
            menuItems.map(item => 
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
            
            setMenuItems([...menuItems, newMenuItem]);
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

  return { handleSaveItem, isSaving, setIsSaving };
};
