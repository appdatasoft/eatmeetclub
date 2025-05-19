
import { useRestaurantFetch } from './useRestaurantFetch';
import { useMenuItems } from './useMenuItems';

export const useMenuItemsFetch = (restaurantId?: string) => {
  const { restaurant, isLoading: isRestaurantLoading, isOwner, error: restaurantError } = useRestaurantFetch(restaurantId, undefined);
  const { menuItems, setMenuItems, isLoading: areMenuItemsLoading, error: menuItemsError, retryFetch } = useMenuItems(restaurantId);
  
  const isLoading = isRestaurantLoading || areMenuItemsLoading;
  const error = restaurantError || menuItemsError;

  return {
    restaurant,
    menuItems,
    isLoading,
    isOwner,
    setMenuItems,
    error,
    retryFetch
  };
};
