
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
  const [formErrors, setFormErrors] = useState<{
    cardNumber?: boolean;
    cardExpiry?: boolean;
    cardCvc?: boolean;
  }>({});
  const [networkError, setNetworkError] = useState<string | null>(null);
  
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

  const validateCardDetails = (values: MembershipFormValues) => {
    const errors: {
      cardNumber?: boolean;
      cardExpiry?: boolean;
      cardCvc?: boolean;
    } = {};
    
    // Basic card number validation (Luhn algorithm is in the schema)
    const cardDigits = values.cardNumber.replace(/\s/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      errors.cardNumber = true;
    }
    
    // Basic expiry date validation
    const [month, year] = values.cardExpiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (
      isNaN(month) || isNaN(year) ||
      month < 1 || month > 12 ||
      year < currentYear || 
      (year === currentYear && month < currentMonth)
    ) {
      errors.cardExpiry = true;
    }
    
    // Basic CVC validation
    if (values.cardCvc.length < 3 || values.cardCvc.length > 4 || !/^\d+$/.test(values.cardCvc)) {
      errors.cardCvc = true;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (values: MembershipFormValues) => {
    try {
      // Reset form errors and network errors
      setFormErrors({});
      setNetworkError(null);
      
      // Validate card details before processing
      const isValid = validateCardDetails(values);
      if (!isValid) {
        toast({
          title: "Invalid card details",
          description: "Please check your card information and try again",
          variant: "destructive",
        });
        return;
      }
      
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
          // If we can't parse the error, it might be a network issue
          errorMessage = response.statusText || "Network error occurred. Please check your connection and try again.";
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Checkout session created:", data);
      
      if (data.success && data.url) {
        // Redirect to Stripe checkout page
        console.log("Redirecting to Stripe checkout URL:", data.url);
        
        // IMPORTANT: Use direct window location change as a string, not an object
        // This ensures the browser treats it as an external URL
        const stripeUrl = data.url.toString();
        console.log("Final redirect URL:", stripeUrl);
        
        // Directly set the window location to the Stripe checkout URL
        window.location.href = stripeUrl;
        
        // Add a fallback redirect using setTimeout
        setTimeout(() => {
          console.log("Executing fallback redirect");
          window.open(stripeUrl, "_self");
        }, 1000);
      } else {
        throw new Error(data.message || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setNetworkError(error.message || "There was a problem processing your payment");
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
    formErrors,
    networkError,
    handleSubmit,
    handleCancel
  };
};

export default useMembershipPayment;
