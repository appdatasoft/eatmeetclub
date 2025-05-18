
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
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Call the RPC function to check if user has active membership
      const { data, error } = await supabase.rpc('has_active_membership', {
        user_id: user.id
      });
      
      if (error) throw error;
      
      setIsActive(!!data);
      
      // Get membership details if active
      if (data) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
          
        if (membershipError) throw membershipError;
        
        setMembership(membershipData);
        setExpiresAt(membershipData?.renewal_at || null);
      } else {
        setMembership(null);
      }
    } catch (error) {
      console.error('Error checking membership status:', error);
      setIsActive(false);
      setMembership(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    refreshMembership();
  }, [user]);

  return { isActive, isLoading, expiresAt, membership, refreshMembership };
};
