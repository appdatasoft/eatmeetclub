
import { MediaItem } from '@/components/restaurants/menu';
import { fetchMediaForMenuItem, fetchIngredientsForMenuItem } from './media/fetchMediaUtils';
import { deleteMediaItem } from './media/mediaManagement';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useMenuItemMedia = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  
  // Wrap the fetch functions with enhanced retry logic
  const fetchMediaWithRetry = async (restaurantId: string, menuItemId: string) => {
    setIsRetrying(true);
    try {
      const result = await fetchWithRetry(
        () => fetchMediaForMenuItem(restaurantId, menuItemId),
        { 
          retries: 5,  // Increased from 3 to 5
          baseDelay: 1000, // Increased from 500 to 1000
          maxDelay: 10000,
          shouldRetry: (error) => {
            // Always retry network errors
            return true;
          },
          onRetry: (attempt, delay) => {
            console.log(`Retrying media fetch (${attempt}) after ${delay}ms delay`);
          }
        }
      );
      return result;
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
  
  const fetchIngredientsWithRetry = async (menuItemId: string) => {
    setIsRetrying(true);
    try {
      return await fetchWithRetry(
        () => fetchIngredientsForMenuItem(menuItemId),
        { 
          retries: 5, 
          baseDelay: 1000,
          maxDelay: 10000,
          onRetry: (attempt, delay) => {
            console.log(`Retrying ingredients fetch (${attempt}) after ${delay}ms delay`);
          }
        }
      );
    } catch (error: any) {
      console.error(`Failed to fetch ingredients after multiple retries:`, error);
      return [];
    } finally {
      setIsRetrying(false);
    }
  };
  
  const deleteMediaWithRetry = async (filePath: string) => {
    setIsRetrying(true);
    try {
      return await fetchWithRetry(
        () => deleteMediaItem(filePath),
        { 
          retries: 3, 
          baseDelay: 500,
          maxDelay: 5000
        }
      );
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
