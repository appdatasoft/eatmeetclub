
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Restaurant {
  id: string;
  name: string;
  user_id: string;
  description?: string;  // Ensuring description is defined in this type
}

export const useRestaurantFetch = (restaurantId: string | undefined) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setIsLoading(false);
        setError('Restaurant ID is required');
        return;
      }
      
      try {
        console.log('Fetching restaurant details for:', restaurantId);
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
          
        if (error) {
          console.error('Error fetching restaurant:', error);
          setError(error.message);
          return;
        }
        
        if (!data) {
          setError('Restaurant not found');
          return;
        }
        
        console.log('Restaurant data from useRestaurantFetch:', data);
        setRestaurant(data);
        
        // Check if user is owner
        setIsOwner(user?.id === data.user_id);
        
      } catch (err: any) {
        console.error('Error in fetchRestaurant:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurant();
  }, [restaurantId, user]);

  return {
    restaurant,
    isLoading,
    error,
    isOwner
  };
};
