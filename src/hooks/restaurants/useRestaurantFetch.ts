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
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  cuisine_type: string;
  website?: string;
}

export const useRestaurantFetch = (restaurantId: string | undefined, retryTrigger: number = 0) => {
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
        setError(null);
        
        // Use cache when available
        const cacheKey = `restaurant_${restaurantId}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        // Only use cache if not a manual retry
        if (cachedData && retryTrigger === 0) {
          try {
            const { data, timestamp } = JSON.parse(cachedData);
            // Use cache for 2 minutes
            if (Date.now() - timestamp < 120000) {
              console.log('Using cached restaurant data');
              setRestaurant(data);
              setIsOwner(user?.id === data.user_id);
              setIsLoading(false);
              return;
            } else {
              // Cache expired, remove it
              console.log('Cache expired, removing');
              sessionStorage.removeItem(cacheKey);
            }
          } catch (e) {
            console.warn("Error parsing cached restaurant", e);
            sessionStorage.removeItem(cacheKey);
          }
        }
        
        // Use the enhanced fetchWithRetry function with proper cloning
        const result = await fetchWithRetry(async () => {
          return await supabase
            .from('restaurants')
            .select('*')
            .eq('id', restaurantId)
            .single();
        }, {
          retries: 3,
          baseDelay: 1000
        });
        
        if (result.error) {
          console.error('Error fetching restaurant:', result.error);
          setError(result.error.message);
          return;
        }
        
        if (!result.data) {
          setError('Restaurant not found');
          return;
        }
        
        // Create a safe clone to ensure we don't run into issues
        const safeData = JSON.parse(JSON.stringify(result.data));
        
        // Response exists, save it
        setRestaurant(safeData);
        
        // Cache the result to avoid repeated fetches
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: safeData,
          timestamp: Date.now()
        }));
        
        // Check if user is owner
        setIsOwner(user?.id === safeData.user_id);
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
  }, [restaurantId, user, toast, retryTrigger]);

  // Add a retry function
  const retryFetch = async () => {
    setError(null);
    setIsLoading(true);
    
    // Clear the cache to force a fresh fetch
    if (restaurantId) {
      sessionStorage.removeItem(`restaurant_${restaurantId}`);
    }
    
    // This will trigger the effect to run again and retry the fetch
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
