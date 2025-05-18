
import { MediaItem } from '@/components/restaurants/menu';
import { fetchMediaForMenuItem, fetchIngredientsForMenuItem } from './media/fetchMediaUtils';
import { deleteMediaItem } from './media/mediaManagement';
import { fetchWithRetry } from '@/utils/fetchUtils';

export const useMenuItemMedia = () => {
  // Wrap the fetch functions with retry logic
  const fetchMediaWithRetry = async (restaurantId: string, menuItemId: string) => {
    return await fetchWithRetry(
      () => fetchMediaForMenuItem(restaurantId, menuItemId),
      { retries: 3, baseDelay: 500 }
    );
  };
  
  const fetchIngredientsWithRetry = async (menuItemId: string) => {
    return await fetchWithRetry(
      () => fetchIngredientsForMenuItem(menuItemId),
      { retries: 3, baseDelay: 500 }
    );
  };
  
  const deleteMediaWithRetry = async (filePath: string) => {
    return await fetchWithRetry(
      () => deleteMediaItem(filePath),
      { retries: 2, baseDelay: 300 }
    );
  };
  
  return {
    fetchMediaForMenuItem: fetchMediaWithRetry,
    fetchIngredientsForMenuItem: fetchIngredientsWithRetry,
    deleteMediaItem: deleteMediaWithRetry
  };
};
