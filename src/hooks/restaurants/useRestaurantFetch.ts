
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithRetry } from '@/utils/fetchUtils';
import { useToast } from '@/hooks/use-toast';

export interface Restaurant {
  id: string;
  name: string;
  user_id: string;
  description?: string;
  logo_url?: string | null;
}

export const useRestaurantFetch = (restaurantId: string | undefined) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

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
        
        // Use cache when available
        const cacheKey = `restaurant_${restaurantId}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        if (cachedData) {
          try {
            const { data, timestamp } = JSON.parse(cachedData);
            // Use cache for 5 minutes
            if (Date.now() - timestamp < 300000) {
              console.log('Using cached restaurant data');
              setRestaurant(data);
              setIsOwner(user?.id === data.user_id);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Error parsing cached restaurant", e);
            sessionStorage.removeItem(cacheKey);
          }
        }
        
        // Fetch with retry if cache is not available or expired
        const { data, error } = await fetchWithRetry(async () => {
          return await supabase
            .from('restaurants')
            .select('*')
            .eq('id', restaurantId)
            .single();
        }, {
          retries: 4,
          baseDelay: 1000
        });
        
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
        
        // Cache the restaurant data
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        
        // Check if user is owner
        setIsOwner(user?.id === data.user_id);
        
      } catch (err: any) {
        console.error('Error in fetchRestaurant:', err);
        setError(err.message);
        
        toast({
          title: "Error loading restaurant",
          description: "Could not load restaurant details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurant();
  }, [restaurantId, user, toast]);

  // Add a retry function
  const retryFetch = async () => {
    setError(null);
    setIsLoading(true);
    
    // Clear the cache to force a fresh fetch
    if (restaurantId) {
      sessionStorage.removeItem(`restaurant_${restaurantId}`);
    }
    
    // This will trigger the effect to run again
    setRestaurant(null);
  };

  return {
    restaurant,
    isLoading,
    error,
    isOwner,
    retryFetch
  };
};
