
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast as showToast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";

interface PaymentVerificationProps {
  setIsLoading?: (loading: boolean) => void;
  navigate?: NavigateFunction;
}

interface VerificationOptions {
  forceCreateUser?: boolean;
  sendPasswordEmail?: boolean;
  createMembershipRecord?: boolean;
  sendInvoiceEmail?: boolean;
  simplifiedVerification?: boolean;
  retry?: boolean;
  maxRetries?: number;
  forceSendEmails?: boolean;
  restaurantId?: string;
}

export const usePaymentVerification = (props: PaymentVerificationProps = {}) => {
  const { setIsLoading, navigate } = props;
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Function to verify payment with the backend
  const verifyPayment = async (
    paymentId: string, 
    options: VerificationOptions = {}
  ): Promise<boolean> => {
    setIsVerifyingPayment(true);
    if (setIsLoading) setIsLoading(true);
    
    try {
      // Update verification attempts count
      setVerificationAttempts(prev => prev + 1);
      
      // Get user details from localStorage
      const storedEmail = localStorage.getItem('signup_email');
      const storedName = localStorage.getItem('signup_name');
      const storedPhone = localStorage.getItem('signup_phone');
      const storedAddress = localStorage.getItem('signup_address');
      
      if (!storedEmail) {
        throw new Error("Missing email for payment verification");
      }
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { 
        email: storedEmail, 
        name: storedName, 
        phone: storedPhone,
        restaurantId: options.restaurantId 
      });
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      const requestBody = {
        paymentId,
        email: storedEmail,
        name: storedName,
        phone: storedPhone || null,
        address: storedAddress || null,
        isSubscription: true,
        restaurantId: options.restaurantId,
        // Add other options
        forceCreateUser: options.forceCreateUser,
        sendPasswordEmail: options.sendPasswordEmail,
        createMembershipRecord: options.createMembershipRecord,
        sendInvoiceEmail: options.sendInvoiceEmail,
        simplifiedVerification: options.simplifiedVerification,
        forceSendEmails: options.forceSendEmails
      };
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }
      
      console.log("Payment verification response:", data);
      
      if (data.success) {
        setIsPaymentVerified(true);
        showToast({
          title: "Payment successful!",
          description: "Your membership has been activated.",
        });
        
        // Clean up localStorage
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_address');
        
        // Redirect to login or dashboard based on user status
        if (navigate) {
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
        
        return true;
      } else {
        // If retry option is enabled and we're below max retries
        if (options.retry && 
            options.maxRetries && 
            verificationAttempts < options.maxRetries) {
          console.log(`Verification attempt ${verificationAttempts} failed, retrying...`);
          
          // Wait briefly before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Recursive retry with same options
          return verifyPayment(paymentId, options);
        }
        
        throw new Error(data.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      showToast({
        title: "Error",
        description: error.message || "There was a problem verifying your payment",
        variant: "destructive",
      });
      return false;
    } finally {
      if (setIsLoading) setIsLoading(false);
      setIsVerifyingPayment(false);
    }
  };

  // Check if we need to verify a successful payment based on URL params
  const checkPaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id');
    const restaurantId = urlParams.get('restaurant_id');
    
    if (success && sessionId) {
      verifyPayment(sessionId, { restaurantId: restaurantId || undefined });
    }
  };

  return {
    isPaymentVerified,
    isVerifyingPayment,
    verificationAttempts,
    verifyPayment,
    checkPaymentStatus
  };
};

export default usePaymentVerification;
