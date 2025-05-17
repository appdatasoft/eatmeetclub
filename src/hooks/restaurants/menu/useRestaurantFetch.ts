
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRestaurantFetch = (restaurantId: string | undefined, userId: string | undefined) => {
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) return;
      
      try {
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
          
        if (restaurantError) throw restaurantError;
        
        setRestaurant(restaurantData);
        
        // Check if user is the owner of the restaurant
        if (userId) {
          setIsOwner(restaurantData.user_id === userId);
        }
      } catch (error: any) {
        console.error('Error fetching restaurant:', error);
        setError(error.message || 'Failed to fetch restaurant');
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch restaurant',
          variant: 'destructive'
        });
      } 
    };
    
    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId, userId, toast]);

  return { restaurant, isLoading, isOwner, error };
};
