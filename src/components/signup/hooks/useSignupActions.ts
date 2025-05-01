
import { useState, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignupFormValues } from "../SignupForm";

interface UseSignupActionsProps {
  setIsLoading: (loading: boolean) => void;
  setUserDetails: (details: SignupFormValues | null) => void;
  setShowPaymentForm: (show: boolean) => void;
  setIsNotificationSent: (sent: boolean) => void;
  toast: any;
  navigate: NavigateFunction;
}

export const useSignupActions = ({
  setIsLoading,
  setUserDetails,
  setShowPaymentForm,
  setIsNotificationSent,
  toast,
  navigate
}: UseSignupActionsProps) => {
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  
  // Check if we need to verify a successful payment based on URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id');
    
    if (success && sessionId) {
      verifyPayment(sessionId);
    }
  }, []);

  // Function to verify payment with the backend
  const verifyPayment = async (paymentId: string) => {
    setIsVerifyingPayment(true);
    setIsLoading(true);
    try {
      const email = localStorage.getItem('signup_email');
      const name = localStorage.getItem('signup_name');
      const phone = localStorage.getItem('signup_phone');
      
      if (!email || !name) {
        throw new Error("Missing user details for payment verification");
      }
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email, name, phone });
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        toast({
          title: "Payment successful!",
          description: "Your membership has been activated.",
        });
        
        // Clean up localStorage
        setTimeout(() => {
          localStorage.removeItem('signup_email');
          localStorage.removeItem('signup_name');
          localStorage.removeItem('signup_phone');
          
          // Redirect to login
          navigate("/login?verified=true");
        }, 3000);
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
      setIsLoading(false);
      setIsVerifyingPayment(false);
    }
  };

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      // Store the user details for later use in payment verification
      localStorage.setItem('signup_email', values.email);
      localStorage.setItem('signup_name', values.email.split('@')[0]); // Using part of email as name since we don't collect full name
      if (values.phoneNumber) {
        localStorage.setItem('signup_phone', values.phoneNumber);
      }

      // Register the user in Supabase Auth
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            phone: values.phoneNumber || null,
          },
        },
      });

      if (error) throw error;

      // Send notification via the edge function
      const notificationResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-member-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            name: values.email.split('@')[0], // Just using part of email as name
            phone: values.phoneNumber,
          }),
        }
      );

      if (notificationResponse.ok) {
        setIsNotificationSent(true);
        toast({
          title: "Confirmation sent!",
          description: "We've sent you an email and text confirmation.",
        });
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });

      // Proceed to payment form
      setUserDetails(values);
      setShowPaymentForm(true);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedEmail = localStorage.getItem('signup_email');
    const storedName = localStorage.getItem('signup_name');
    const storedPhone = localStorage.getItem('signup_phone');
    
    if (!storedEmail) return;
    
    setIsLoading(true);

    try {
      console.log("Initiating payment process with user details:", storedEmail);
      
      // Create a Stripe checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: storedEmail,
            name: storedName || storedEmail.split('@')[0], // Using stored name or part of email
            phone: storedPhone,
          }),
        }
      );
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = "Failed to create checkout session";
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Checkout session created:", data);
      
      if (data.success && data.url) {
        // Redirect to the Stripe checkout page
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem initiating the checkout process",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return {
    isPaymentVerified,
    isVerifyingPayment,
    handleSignupSubmit,
    handlePayment
  };
};
