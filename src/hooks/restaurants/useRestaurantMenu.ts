
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { useMenuItems } from '@/hooks/restaurants/menu/useMenuItems';
import { useMenuItemSave } from '@/hooks/restaurants/menu/useMenuItemSave';
import { useMenuItemOperations } from '@/hooks/restaurants/menu/useMenuItemOperations';

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
  const { saveMenuItem } = useMenuItemSave();
  const { updateMenuItem, deleteMenuItem } = useMenuItemOperations();
  
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
    
    const success = await deleteMenuItem(itemId, restaurantId);
    
    if (success) {
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Item Deleted",
        description: "Menu item has been removed",
      });
    } else {
      toast({
        title: "Failed to Delete",
        description: "Could not remove the menu item. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle save item
  const handleSaveItem = async (item: MenuItem) => {
    if (!restaurantId) return;
    
    try {
      setIsSaving(true);
      
      const isNewItem = !item.id;
      const result = await saveMenuItem(item, restaurantId);
      
      if (result.success) {
        if (isNewItem) {
          setMenuItems([...menuItems, result.item]);
        } else {
          setMenuItems(menuItems.map(mi => mi.id === item.id ? result.item : mi));
        }
        
        setIsDialogOpen(false);
        setCurrentItem(null);
        
        toast({
          title: isNewItem ? "Item Created" : "Item Updated",
          description: isNewItem 
            ? "New menu item has been created" 
            : "Menu item has been updated",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save menu item",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
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
