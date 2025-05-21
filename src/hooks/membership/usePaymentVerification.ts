
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface PaymentVerificationProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface VerificationResult {
  success: boolean;
  userId?: string;
  userCreated?: boolean;
  membershipId?: string;
  error?: string;
}

export const usePaymentVerification = ({
  onSuccess,
  onError
}: PaymentVerificationProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const navigate = useNavigate();

  const verifyPayment = async (
    paymentId: string, 
    options: Record<string, any> = {}
  ): Promise<VerificationResult> => {
    try {
      setIsVerifying(true);
      setVerificationStatus('loading');
      setVerificationAttempts(prev => prev + 1);
      
      // Get stored email (set during signup process)
      const email = localStorage.getItem('signup_email');
      
      if (!email) {
        const errorMessage = "Missing email for verification";
        setVerificationError(errorMessage);
        setVerificationStatus('error');
        if (onError) onError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      console.log(`Verifying payment ${paymentId} for email ${email}`);
      
      // Call the verify-membership-payment edge function
      const { data, error } = await supabase.functions.invoke('verify-membership-payment', {
        body: { 
          paymentId,
          email,
          restaurantId: options.restaurantId,
          options
        }
      });
      
      if (error) {
        const errorMessage = error.message || "Failed to verify payment";
        setVerificationError(errorMessage);
        setVerificationStatus('error');
        
        toast({
          title: "Verification Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        if (onError) onError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      console.log("Payment verification response:", data);
      
      if (data?.success) {
        // Clear stored signup data
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_address');
        
        setVerificationStatus('success');
        
        // Show success message
        toast({
          title: "Payment Successful",
          description: "Your membership has been processed successfully.",
        });
        
        // Trigger success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        return data;
      } else {
        const errorMessage = data?.message || "Verification failed";
        setVerificationError(errorMessage);
        setVerificationStatus('error');
        
        toast({
          title: "Verification Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        if (onError) onError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      
      const errorMessage = error.message || "Verification failed";
      setVerificationError(errorMessage);
      setVerificationStatus('error');
      
      // Show error message
      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Trigger error callback if provided
      if (onError) {
        onError(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsVerifying(false);
    }
  };

  const retryVerification = (paymentId: string, options: Record<string, any> = {}) => {
    return verifyPayment(paymentId, options);
  };

  const navigateAfterSuccess = () => {
    navigate('/dashboard');
  };

  return {
    isVerifying,
    verifyPayment,
    retryVerification,
    verificationAttempts,
    verificationError,
    verificationStatus,
    navigateAfterSuccess
  };
};

export default usePaymentVerification;
