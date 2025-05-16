
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRestaurantMenu } from '@/hooks/restaurants/useRestaurantMenu';
import MenuHeader from '@/components/restaurants/menu/MenuHeader';
import MenuItemsList from '@/components/restaurants/menu/MenuItemsList';
import MenuItemDialog from '@/components/restaurants/menu/MenuItemDialog';
import MenuLoadingState from '@/components/restaurants/menu/MenuLoadingState';
import MenuErrorState from '@/components/restaurants/menu/MenuErrorState';

const RestaurantMenu = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const navigate = useNavigate();
  
  const {
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
  } = useRestaurantMenu(id);

  const goBack = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return <MenuLoadingState />;
  }

  if (!restaurant) {
    return (
      <MenuErrorState 
        title="Restaurant not found"
        description="The restaurant you're looking for doesn't exist or you don't have permission to view it."
        onBack={goBack}
      />
    );
  }

  if (!isOwner) {
    return (
      <MenuErrorState 
        title="Access Denied"
        description="Only the owner of this restaurant can manage its menu."
        onBack={goBack}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MenuHeader 
          restaurantName={restaurant?.name} 
          handleAddItem={handleAddItem} 
        />

        <MenuItemsList 
          menuItems={menuItems} 
          handleEditItem={handleEditItem} 
          handleDeleteItem={handleDeleteItem} 
        />

        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
      </div>

      <MenuItemDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        currentItem={currentItem}
        isSaving={isSaving}
        onSave={handleSaveItem}
      />
    </DashboardLayout>
  );
};

export default RestaurantMenu;
