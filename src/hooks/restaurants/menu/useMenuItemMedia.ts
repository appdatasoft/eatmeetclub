
import { MediaItem } from '@/components/restaurants/menu';
import { fetchMediaForMenuItem, fetchIngredientsForMenuItem } from './media/fetchMediaUtils';
import { deleteMediaItem } from './media/mediaManagement';

export const useMenuItemMedia = () => {
  return {
    fetchMediaForMenuItem,
    fetchIngredientsForMenuItem,
    deleteMediaItem
  };
};
