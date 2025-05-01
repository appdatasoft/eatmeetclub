
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast as showToast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";

interface PaymentVerificationProps {
  setIsLoading: (loading: boolean) => void;
  navigate: NavigateFunction;
}

export const usePaymentVerification = ({
  setIsLoading,
  navigate
}: PaymentVerificationProps) => {
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Function to verify payment with the backend
  const verifyPayment = async (paymentId: string) => {
    setIsVerifyingPayment(true);
    setIsLoading(true);
    
    try {
      // Try to get session data if we have an authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get user details from localStorage or session
      const storedEmail = localStorage.getItem('signup_email');
      const storedName = localStorage.getItem('signup_name');
      const storedPhone = localStorage.getItem('signup_phone');
      
      const email = session?.user?.email || storedEmail;
      const name = (session?.user?.user_metadata?.name || storedName || email?.split('@')[0]) as string;
      const phone = session?.user?.user_metadata?.phone || storedPhone;
      
      if (!email) {
        throw new Error("Missing email for payment verification");
      }
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email, name, phone });
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      // Add authorization header if we have a session
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            paymentId,
            email,
            name,
            phone: phone || null,
            isSubscription: true
          }),
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
        
        // Redirect to login or dashboard based on user status
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        throw new Error(data.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      showToast({
        title: "Error",
        description: error.message || "There was a problem verifying your payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsVerifyingPayment(false);
    }
  };

  // Check if we need to verify a successful payment based on URL params
  const checkPaymentStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id');
    
    if (success && sessionId) {
      verifyPayment(sessionId);
    }
  };

  return {
    isPaymentVerified,
    isVerifyingPayment,
    verifyPayment,
    checkPaymentStatus
  };
};
