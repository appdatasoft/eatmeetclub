
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import useAuth from "./useAuth";

export interface Membership {
  id: string;
  status: 'active' | 'expired' | 'canceled';
  is_subscription: boolean;
  started_at: string;
  renewal_at: string | null;
  subscription_id: string | null;
  product_id: string | null;
}

export interface MembershipResponse {
  membership: Membership | null;
  isLoading: boolean;
  isActive: boolean;
  error: Error | null;
  refreshMembership: () => Promise<void>;
}

export const useMembershipStatus = (): MembershipResponse => {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchMembership = async () => {
    if (!user) {
      setMembership(null);
      setIsActive(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the membership data
      const { data, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      if (data) {
        // Ensure the status is one of the allowed types
        const typedStatus = data.status as 'active' | 'expired' | 'canceled';
        
        // Create a properly typed membership object
        const typedMembership: Membership = {
          id: data.id,
          status: typedStatus,
          is_subscription: data.is_subscription,
          started_at: data.started_at,
          renewal_at: data.renewal_at,
          subscription_id: data.subscription_id,
          // Initialize product_id as null
          product_id: null
        };
        
        // Safely check if product_id exists in the data and assign it with proper type casting
        if ('product_id' in data && data.product_id !== undefined) {
          typedMembership.product_id = data.product_id as string;
        }
        
        setMembership(typedMembership);
        
        // Check if membership is active
        const isActiveStatus = typedStatus === 'active';
        const notExpired = !data.renewal_at || new Date(data.renewal_at) > new Date();
        setIsActive(isActiveStatus && notExpired);
      } else {
        setMembership(null);
        setIsActive(false);
      }
    } catch (err) {
      console.error("Error fetching membership:", err);
      setError(err as Error);
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, [user]);

  return {
    membership,
    isLoading,
    isActive,
    error,
    refreshMembership: fetchMembership
  };
};

export default useMembershipStatus;
