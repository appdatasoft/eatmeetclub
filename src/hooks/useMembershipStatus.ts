
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export const useMembershipStatus = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    const checkMembershipStatus = async () => {
      if (!user) {
        setIsActive(false);
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
            .select('renewal_at')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
            
          if (membershipError) throw membershipError;
          
          setExpiresAt(membershipData?.renewal_at || null);
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
        setIsActive(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkMembershipStatus();
  }, [user]);

  return { isActive, isLoading, expiresAt };
};
