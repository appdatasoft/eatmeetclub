
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMembershipVerification = (sessionId: string | null) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return;

      setIsVerifying(true);
      setVerificationError(null);

      try {
        // Get user email from session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error("Unable to get session: " + sessionError.message);
        }
        
        const userEmail = sessionData?.session?.user?.email;
        
        if (!userEmail) {
          throw new Error("No user email found in session");
        }
        
        // Call function to verify the payment
        const { data, error } = await supabase.functions.invoke('verify-membership-payment', {
          body: { 
            sessionId,
            email: userEmail
          }
        });

        if (error) throw new Error(error.message);

        if (!data?.success) {
          throw new Error(data?.message || "Payment verification failed");
        }

        // Store the user ID if returned
        if (data.userId) {
          setUserId(data.userId);
        }

        setIsVerified(true);
        
        toast({
          title: "Payment Verified",
          description: "Your membership payment has been successfully verified.",
        });

      } catch (error: any) {
        console.error("Payment verification error:", error);
        setVerificationError(error.message);

        toast({
          title: "Verification Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    if (sessionId && !isVerified && !isVerifying) {
      verifyPayment();
    }
  }, [sessionId, toast, isVerified, isVerifying]);

  return {
    isVerifying,
    isVerified,
    verificationError,
    userId
  };
};

export default useMembershipVerification;
