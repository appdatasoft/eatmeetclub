
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MembershipFormValues } from "@/components/membership/MembershipPaymentForm";

export const useMembershipPayment = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [membershipFee, setMembershipFee] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const paymentCanceled = searchParams.get('canceled') === 'true';
  const paymentSuccess = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');

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

  useEffect(() => {
    if (paymentSuccess && sessionId) {
      verifyPayment(sessionId);
    }
  }, [paymentSuccess, sessionId]);

  const verifyPayment = async (paymentId: string) => {
    setIsProcessing(true);
    
    try {
      // Get user details from localStorage
      const storedEmail = localStorage.getItem('signup_email');
      const storedName = localStorage.getItem('signup_name');
      const storedPhone = localStorage.getItem('signup_phone');
      const storedAddress = localStorage.getItem('signup_address');
      
      if (!storedEmail) {
        throw new Error("Missing email for payment verification");
      }
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email: storedEmail, name: storedName, phone: storedPhone });
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            paymentId,
            email: storedEmail,
            name: storedName,
            phone: storedPhone || null,
            address: storedAddress || null,
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
        toast({
          title: "Payment successful!",
          description: "Your membership has been activated. Check your email for login instructions.",
        });
        
        // Clean up localStorage
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_address');
      } else {
        throw new Error(data.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem verifying your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (values: MembershipFormValues) => {
    try {
      setIsProcessing(true);
      console.log("Processing membership signup with values:", values);
      
      // Store user details in localStorage for later use in verification
      localStorage.setItem('signup_email', values.email);
      localStorage.setItem('signup_name', values.name);
      localStorage.setItem('signup_phone', values.phone || '');
      localStorage.setItem('signup_address', values.address);
      
      // Set explicit headers without relying on authentication
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Create a Stripe checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            email: values.email,
            name: values.name,
            phone: values.phone,
            address: values.address,
          }),
        }
      );
      
      if (!response.ok) {
        let errorMessage = "Failed to create checkout session";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Checkout session created:", data);
      
      if (data.success && data.url) {
        // Redirect to Stripe checkout page
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return {
    membershipFee,
    isLoading,
    isProcessing,
    paymentCanceled,
    paymentSuccess,
    sessionId,
    handleSubmit,
    handleCancel
  };
};

export default useMembershipPayment;
