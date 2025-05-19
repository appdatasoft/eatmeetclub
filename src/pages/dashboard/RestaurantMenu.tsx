import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRestaurantMenu } from '@/hooks/restaurants/useRestaurantMenu';
import MenuHeader from '@/components/restaurants/menu/MenuHeader';
import MenuItemsList from '@/components/restaurants/menu/MenuItemsList';
import MenuItemDialog from '@/components/restaurants/menu/MenuItemDialog';
import MenuLoadingState from '@/components/restaurants/menu/MenuLoadingState';
import MenuErrorState from '@/components/restaurants/menu/MenuErrorState';
import { useState, useEffect } from 'react';
import RetryAlert from '@/components/ui/RetryAlert';
import RestaurantFallback from '@/components/restaurants/details/RestaurantFallback';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

const RestaurantMenu = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Add state for manual retry
  const [isManualRetry, setIsManualRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const {
    restaurant,
    menuItems,
    isLoading,
    isSaving,
    isDialogOpen,
    currentItem,
    isOwner,
    error,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleSaveItem,
    handleDialogClose,
    retryFetch
  } = useRestaurantMenu(id, retryCount);

  const goBack = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      navigate('/dashboard');
    }
  };
  
  const handleRetry = () => {
    setIsManualRetry(true);
    // Increment retry count to trigger a new fetch
    setRetryCount(prev => prev + 1);
    
    toast({
      title: "Retrying...",
      description: "Attempting to load restaurant menu data again.",
    });
    
    // Call the retry function from the hook
    retryFetch();
  };
  
  // Reset manual retry flag when loading completes
  useEffect(() => {
    if (!isLoading && isManualRetry) {
      setIsManualRetry(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return <MenuLoadingState />;
  }
  
  if (error) {
    return (
      <MenuErrorState 
        title="Error Loading Menu"
        description={error + " We're experiencing high server load. Please try again."}
        onBack={goBack}
        onRetry={handleRetry}
        isRetrying={isManualRetry}
      />
    );
  }

  if (!restaurant) {
    return (
      <RestaurantFallback
        onRetry={handleRetry}
        isRetrying={isManualRetry}
        title="Restaurant Not Found"
        description="The restaurant you're looking for doesn't exist or you don't have permission to view it."
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
        {/* Warning alert for rate limiting issues */}
        <RetryAlert
          message="We're experiencing high server load. If you encounter loading issues, please use the retry button."
          onRetry={handleRetry}
          isRetrying={isManualRetry}
          title="Connection Issues"
          severity="info"
          showSpinner={false}
        />

        <MenuHeader 
          restaurantName={restaurant?.name} 
          handleAddItem={handleAddItem} 
        />

        <MenuItemsList 
          menuItems={menuItems} 
          handleEditItem={handleEditItem} 
          handleDeleteItem={handleDeleteItem} 
          isLoading={isLoading}
        />

        <Button variant="outline" onClick={goBack} className="mr-2">
          Back
        </Button>
        
        {/* Additional retry button at the bottom */}
        <Button 
          variant="secondary" 
          onClick={handleRetry} 
          disabled={isManualRetry}
        >
          {isManualRetry ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Menu
            </>
          )}
        </Button>
      </div>

      <MenuItemDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        currentItem={currentItem}
        isSaving={isSaving}
        onSave={handleSaveItem}
        restaurantId={id || ''}
      />
    </DashboardLayout>
  );
};

export default RestaurantMenu;
