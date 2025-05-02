
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMembershipConfig = () => {
  const [membershipFee, setMembershipFee] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembershipFee = async () => {
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'MEMBERSHIP_FEE')
          .single();
        
        if (!error && data) {
          setMembershipFee(Number(data.value));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembershipFee();
  }, []);

  return { membershipFee, isLoading };
};

export default useMembershipConfig;
