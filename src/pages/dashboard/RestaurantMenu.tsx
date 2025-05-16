
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MenuItemForm, { MenuItemFormValues } from '@/components/restaurants/menu/MenuItemForm';
import MenuItemCard, { MenuItem } from '@/components/restaurants/menu/MenuItemCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const RestaurantMenu = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { user } = useAuth();
  const navigate = useNavigate();
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
      if (!id || !user) return;

      try {
        setIsLoading(true);
        
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();
          
        if (restaurantError) throw restaurantError;
        
        setRestaurant(restaurantData);
        
        // Check if user is the owner of the restaurant
        setIsOwner(restaurantData.user_id === user.id);
        
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('restaurant_menu_items')
          .select('*, ingredients:restaurant_menu_ingredients(name)')
          .eq('restaurant_id', id)
          .order('name', { ascending: true });
          
        if (menuError) throw menuError;
        
        // Transform the data to match our MenuItem interface
        const transformedItems: MenuItem[] = menuData.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          ingredients: item.ingredients.map((ingredient: any) => ingredient.name)
        }));
        
        setMenuItems(transformedItems);
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
  }, [id, user, toast]);

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
      // Delete the menu item ingredients
      await supabase
        .from('restaurant_menu_ingredients')
        .delete()
        .eq('menu_item_id', itemId);
      
      // Delete the menu item
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
    if (!id || !user) return;
    
    try {
      setIsSaving(true);
      
      // If we're editing an existing item
      if (currentItem) {
        // Update the menu item
        const { error: updateError } = await supabase
          .from('restaurant_menu_items')
          .update({
            name: values.name,
            description: values.description,
            price: values.price
          })
          .eq('id', currentItem.id);
          
        if (updateError) throw updateError;
        
        // Delete existing ingredients
        await supabase
          .from('restaurant_menu_ingredients')
          .delete()
          .eq('menu_item_id', currentItem.id);
        
        // Add new ingredients
        if (values.ingredients.length > 0) {
          const ingredientsToInsert = values.ingredients.filter(ing => ing.trim() !== '').map(name => ({
            menu_item_id: currentItem.id,
            name,
            restaurant_id: id
          }));
          
          if (ingredientsToInsert.length > 0) {
            const { error: ingredientsError } = await supabase
              .from('restaurant_menu_ingredients')
              .insert(ingredientsToInsert);
              
            if (ingredientsError) throw ingredientsError;
          }
        }
        
        // Update the UI
        setMenuItems(prev => 
          prev.map(item => 
            item.id === currentItem.id 
              ? { ...item, ...values } 
              : item
          )
        );
      } else {
        // Create a new menu item
        const { data: menuItemData, error: createError } = await supabase
          .from('restaurant_menu_items')
          .insert({
            restaurant_id: id,
            name: values.name,
            description: values.description,
            price: values.price
          })
          .select()
          .single();
          
        if (createError) throw createError;
        
        // Add ingredients
        if (values.ingredients.length > 0) {
          const ingredientsToInsert = values.ingredients.filter(ing => ing.trim() !== '').map(name => ({
            menu_item_id: menuItemData.id,
            name,
            restaurant_id: id
          }));
          
          if (ingredientsToInsert.length > 0) {
            const { error: ingredientsError } = await supabase
              .from('restaurant_menu_ingredients')
              .insert(ingredientsToInsert);
              
            if (ingredientsError) throw ingredientsError;
          }
        }
        
        // Update the UI
        const newItem: MenuItem = {
          id: menuItemData.id,
          name: values.name,
          description: values.description,
          price: values.price,
          ingredients: values.ingredients.filter(ing => ing.trim() !== '')
        };
        
        setMenuItems(prev => [...prev, newItem]);
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

  const goBack = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800">Restaurant not found</h2>
          <p className="mt-2 text-gray-600">
            The restaurant you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={goBack} className="mt-4">
            Go back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!isOwner) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            Only the owner of this restaurant can manage its menu.
          </p>
          <Button onClick={goBack} className="mt-4">
            Go back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Restaurant Menu</h1>
            <p className="text-muted-foreground">
              Manage the menu for {restaurant?.name}
            </p>
          </div>
          <Button onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">
                No menu items yet. Click "Add Menu Item" to create one.
              </p>
            </div>
          )}
        </div>

        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {currentItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <MenuItemForm
            initialValues={currentItem || undefined}
            onSubmit={handleSaveItem}
            isLoading={isSaving}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RestaurantMenu;
