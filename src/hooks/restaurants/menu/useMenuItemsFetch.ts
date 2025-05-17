
import { useRestaurantFetch } from './useRestaurantFetch';
import { useMenuItems } from './useMenuItems';

export const useMenuItemsFetch = (restaurantId: string | undefined, userId: string | undefined) => {
  const { restaurant, isLoading: isRestaurantLoading, isOwner, error: restaurantError } = useRestaurantFetch(restaurantId, userId);
  const { menuItems, setMenuItems, isLoading: areMenuItemsLoading, error: menuItemsError } = useMenuItems(restaurantId);
  
  const isLoading = isRestaurantLoading || areMenuItemsLoading;
  const error = restaurantError || menuItemsError;

  return {
    restaurant,
    menuItems,
    isLoading,
    isOwner,
    setMenuItems,
    error
  };
};
