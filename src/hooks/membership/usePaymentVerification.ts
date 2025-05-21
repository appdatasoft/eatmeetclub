
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface PaymentVerificationProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const usePaymentVerification = ({
  onSuccess,
  onError
}: PaymentVerificationProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const verifyPayment = async (paymentId: string) => {
    try {
      setIsVerifying(true);
      
      // Get stored email (set during signup process)
      const email = localStorage.getItem('signup_email');
      
      if (!email) {
        throw new Error("Missing email for verification");
      }
      
      console.log(`Verifying payment ${paymentId} for email ${email}`);
      
      // Call the verify-membership-payment edge function
      const { data, error } = await supabase.functions.invoke('verify-membership-payment', {
        body: { 
          paymentId,
          email
        }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to verify payment");
      }
      
      console.log("Payment verification response:", data);
      
      if (data?.success) {
        // Clear stored signup data
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_address');
        
        // Show success message
        toast({
          title: "Payment Successful",
          description: "Your membership has been processed successfully.",
        });
        
        // Trigger success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
        
        return data;
      } else {
        throw new Error(data?.message || "Verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      
      // Show error message
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify your payment.",
        variant: "destructive",
      });
      
      // Trigger error callback if provided
      if (onError) {
        onError(error.message || "Verification failed");
      }
      
      return { success: false, error: error.message };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    verifyPayment
  };
};

export default usePaymentVerification;
