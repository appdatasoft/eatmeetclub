
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRestaurantFetch = (restaurantId: string | undefined, userId: string | undefined) => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) return;
      
      try {
        setIsLoading(true);
        
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
        
        if (restaurantError) throw restaurantError;
        
        if (restaurantData) {
          setRestaurant(restaurantData);
          
          // Check if the current user is the owner of this restaurant
          if (userId && restaurantData.user_id === userId) {
            setIsOwner(true);
          }
        } else {
          throw new Error('Restaurant not found');
        }
      } catch (err: any) {
        console.error('Error fetching restaurant:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: err.message || 'Failed to load restaurant',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (restaurantId) {
      fetchRestaurant();
    } else {
      setIsLoading(false);
    }
  }, [restaurantId, userId]);

  return { restaurant, isLoading, isOwner, error };
};
