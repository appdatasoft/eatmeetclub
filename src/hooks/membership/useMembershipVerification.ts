
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const useMembershipVerification = (restaurantId?: string) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!restaurantId || !user) {
        setIsVerifying(false);
        return;
      }

      try {
        setIsVerifying(true);

        const { data, error } = await supabase
          .from('restaurants')
          .select('verification_status')
          .eq('id', restaurantId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking verification status:', error);
          setIsVerified(false);
          return;
        }

        setVerificationStatus(data?.verification_status || null);
        setIsVerified(data?.verification_status === 'verified');
      } catch (err) {
        console.error('Error in verification check:', err);
        setIsVerified(false);
      } finally {
        setIsVerifying(false);
      }
    };

    checkVerificationStatus();
  }, [restaurantId, user]);

  const submitVerification = async (verificationData: any) => {
    if (!restaurantId || !user) {
      return { success: false, error: 'Missing restaurant ID or user' };
    }

    try {
      setIsVerifying(true);

      const { data, error } = await supabase
        .from('restaurants')
        .update({
          ...verificationData,
          verification_status: 'submitted',
        })
        .eq('id', restaurantId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setVerificationStatus('submitted');
      return { success: true };
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to submit verification' 
      };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    isVerified,
    verificationStatus,
    submitVerification
  };
};

export default useMembershipVerification;
