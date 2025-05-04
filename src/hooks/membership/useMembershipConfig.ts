
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMembershipConfig = () => {
  const [membershipFee, setMembershipFee] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembershipFee = async () => {
      try {
        // First try to get from admin_config table (newer implementation)
        let { data: adminConfigData, error: adminConfigError } = await supabase
          .from('admin_config')
          .select('value')
          .eq('key', 'membership_fee')
          .single();
        
        if (!adminConfigError && adminConfigData) {
          // Convert from cents to dollars for display
          setMembershipFee(Number(adminConfigData.value) / 100);
          setIsLoading(false);
          return;
        }
        
        // Fallback to app_config table (older implementation)
        const { data, error } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'MEMBERSHIP_FEE')
          .single();
        
        if (!error && data) {
          setMembershipFee(Number(data.value));
        }
      } catch (error) {
        console.error('Error fetching membership fee:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembershipFee();
  }, []);

  return { membershipFee, isLoading };
};

export default useMembershipConfig;
