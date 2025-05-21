import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export const useMembershipStatus = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [membership, setMembership] = useState<any>(null);
  const [restaurantMemberships, setRestaurantMemberships] = useState<any[]>([]);

  const refreshMembership = async (restaurantId?: string) => {
    if (!user) {
      setIsActive(false);
      setMembership(null);
      setExpiresAt(null);
      setRestaurantMemberships([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // If a specific restaurant ID is provided, query just that membership
      if (restaurantId) {
        const { data, error } = await supabase
          .from('memberships')
          .select('*, restaurant:restaurants(id, name), product:products(name, description)')
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)
          .eq('status', 'active')
          .maybeSingle();
        
        if (error) {
          console.error("Error checking restaurant membership:", error.message);
          throw error;
        }
        
        // Check if membership is active and not expired
        const isActiveMembership = !!data && (!data.renewal_at || new Date(data.renewal_at) > new Date());
        
        return isActiveMembership;
      } 
      // Otherwise get all restaurant memberships
      else {
        const { data, error } = await supabase
          .from('memberships')
          .select('*, restaurant:restaurants(id, name), product:products(name, description)')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        if (error) {
          console.error("Error checking memberships:", error.message);
          throw error;
        }
        
        // Filter to only active and non-expired memberships
        const activeRestaurantMemberships = data?.filter(m => 
          m.status === 'active' && (!m.renewal_at || new Date(m.renewal_at) > new Date())
        ) || [];
        
        setRestaurantMemberships(activeRestaurantMemberships);
        
        // Set isActive based on having at least one active restaurant membership
        setIsActive(activeRestaurantMemberships.length > 0);
        
        // For backward compatibility, set the first membership as the "active" one
        if (activeRestaurantMemberships.length > 0) {
          setMembership(activeRestaurantMemberships[0]);
          setExpiresAt(activeRestaurantMemberships[0]?.renewal_at || null);
        } else {
          setMembership(null);
          setExpiresAt(null);
        }
      }
    } catch (error) {
      console.error('Error checking membership status:', error);
      setIsActive(false);
      setMembership(null);
      setExpiresAt(null);
      setRestaurantMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      refreshMembership();
    } else {
      setIsLoading(false);
      setIsActive(false);
      setMembership(null);
      setExpiresAt(null);
      setRestaurantMemberships([]);
    }
  }, [user]);

  return { 
    isActive,
    isLoading,
    expiresAt, 
    membership, 
    restaurantMemberships,
    hasRestaurantMembership: (restaurantId: string) => {
      return restaurantMemberships.some(m => m.restaurant_id === restaurantId);
    },
    refreshMembership
  };
};

export default useMembershipStatus;
