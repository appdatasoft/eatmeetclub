
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MembershipFormValues } from "@/components/membership/MembershipPaymentForm";

interface UseFormSubmissionProps {
  setIsProcessing: (value: boolean) => void;
  setNetworkError: (value: string | null) => void;
  setClientSecret: (value: string | null) => void;
  setPaymentIntentId: (value: string | null) => void;
}

export const useFormSubmission = ({
  setIsProcessing,
  setNetworkError,
  setClientSecret,
  setPaymentIntentId
}: UseFormSubmissionProps) => {
  const { toast } = useToast();

  const handleSubmit = async (values: MembershipFormValues) => {
    try {
      // Reset errors
      setNetworkError(null);
      
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
      
      // Create a payment intent
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
        let errorMessage = "Failed to create payment intent";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
          errorMessage = response.statusText || "Network error occurred. Please check your connection and try again.";
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Payment intent created:", data);
      
      if (data.success && data.clientSecret) {
        // Save the client secret for the payment element
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        return true;
      } else {
        throw new Error(data.message || "Failed to create payment intent");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setNetworkError(error.message || "There was a problem processing your payment");
      toast({
        title: "Error",
        description: error.message || "There was a problem processing your payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleSubmit };
};

export default useFormSubmission;
