import { MediaItem } from '@/components/restaurants/menu/types/mediaTypes';
import { fetchMediaForMenuItem, fetchIngredientsForMenuItem } from './media/fetchMediaUtils';
import { deleteMediaItem } from './media/mediaManagement';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useMenuItemMedia = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  
  // Wrap the fetch functions with enhanced retry logic
  const fetchMediaWithRetry = async (restaurantId: string, menuItemId: string): Promise<MediaItem[]> => {
    setIsRetrying(true);
    try {
      const result = await fetchWithRetry(
        async () => {
          const mediaItems = await fetchMediaForMenuItem(restaurantId, menuItemId);
          return mediaItems || [];
        },
        { 
          retries: 3,
          baseDelay: 1000,
          shouldRetry: (error) => {
            // Don't retry not found errors
            if (error.message && error.message.includes("not found")) {
              return false;
            }
            return true;
          }
        }
      );
      
      if (Array.isArray(result)) {
        return result;
      }
      return [];
    } catch (error: any) {
      console.error(`Failed to fetch media after multiple retries:`, error);
      toast({
        title: "Media Loading Issue",
        description: "We're having trouble loading media. Please try again later.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsRetrying(false);
    }
  };
  
  const fetchIngredientsWithRetry = async (menuItemId: string): Promise<string[]> => {
    setIsRetrying(true);
    try {
      const result = await fetchWithRetry(
        async () => {
          const ingredients = await fetchIngredientsForMenuItem(menuItemId);
          return ingredients || [];
        },
        { 
          retries: 3,
          baseDelay: 1000,
          shouldRetry: (error) => {
            // Don't retry not found errors
            if (error.message && error.message.includes("not found")) {
              return false;
            }
            return true;
          }
        }
      );
      
      if (Array.isArray(result)) {
        return result;
      }
      return [];
    } catch (error: any) {
      console.error(`Failed to fetch ingredients after multiple retries:`, error);
      return [];
    } finally {
      setIsRetrying(false);
    }
  };
  
  const deleteMediaWithRetry = async (filePath: string): Promise<boolean> => {
    setIsRetrying(true);
    try {
      const result = await fetchWithRetry(
        () => deleteMediaItem(filePath),
        { 
          retries: 3, 
          baseDelay: 500
        }
      );
      
      return !!result;
    } catch (error: any) {
      console.error(`Failed to delete media after multiple retries:`, error);
      toast({
        title: "Delete Operation Failed",
        description: "We couldn't delete this media. Please try again later.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsRetrying(false);
    }
  };
  
  return {
    fetchMediaForMenuItem: fetchMediaWithRetry,
    fetchIngredientsForMenuItem: fetchIngredientsWithRetry,
    deleteMediaItem: deleteMediaWithRetry,
    isRetrying
  };
};
