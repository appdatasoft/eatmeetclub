
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export const useMembershipStatus = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [membership, setMembership] = useState<any>(null);

  const refreshMembership = async () => {
    if (!user) {
      setIsActive(false);
      setMembership(null);
      setExpiresAt(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Query for active membership instead of using RPC
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) {
        console.error("Error checking membership:", error.message);
        throw error;
      }
      
      // Check if membership is active and not expired
      const isActiveMembership = !!data && (!data.renewal_at || new Date(data.renewal_at) > new Date());
      setIsActive(isActiveMembership);
      
      if (data && isActiveMembership) {
        setMembership(data);
        setExpiresAt(data?.renewal_at || null);
      } else {
        setMembership(null);
        setExpiresAt(null);
      }
    } catch (error) {
      console.error('Error checking membership status:', error);
      setIsActive(false);
      setMembership(null);
      setExpiresAt(null);
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
    }
  }, [user]);

  return { isActive, isLoading, expiresAt, membership, refreshMembership };
};

export default useMembershipStatus;
