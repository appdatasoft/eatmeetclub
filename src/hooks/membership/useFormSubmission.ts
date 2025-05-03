import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { MembershipFormValues } from "@/components/membership/MembershipPaymentForm";

interface FormSubmissionProps {
  setIsProcessing: (isProcessing: boolean) => void;
  setNetworkError: (error: string | null) => void;
  setClientSecret: (secret: string | null) => void;
  setPaymentIntentId: (id: string | null) => void;
  setProratedAmount?: (amount: number | null) => void;
  setExistingMembership?: (membership: any) => void;
}

export const useFormSubmission = ({
  setIsProcessing,
  setNetworkError,
  setClientSecret,
  setPaymentIntentId,
  setProratedAmount = () => {},
  setExistingMembership = () => {}
}: FormSubmissionProps) => {
  const { toast } = useToast();
  
  const handleSubmit = async (values: MembershipFormValues) => {
    setIsProcessing(true);
    setNetworkError(null);
    
    try {
      const storedEmail = localStorage.getItem('signup_email');
      if (!storedEmail) {
        console.error("No email found in localStorage for payment");
        throw new Error("Missing email information. Please try signing up again.");
      }
      
      const name = localStorage.getItem('signup_name') || '';
      
      // First, make a request to create a SetupIntent or PaymentIntent
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: storedEmail,
            name: name,
            redirectToCheckout: false
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if the error is due to existing membership
        if (errorData.message && errorData.message.includes("active membership")) {
          toast({
            title: "Active Membership",
            description: "You already have an active membership that doesn't need renewal yet.",
            variant: "default",
          });
          
          // Set existing membership state if available
          if (errorData.membership) {
            setExistingMembership(errorData.membership);
          }
          
          setIsProcessing(false);
          return;
        }
        
        throw new Error(errorData.message || "Failed to create payment intent");
      }
      
      const data = await response.json();
      
      // If the response indicates this is a prorated amount, show message
      if (data.isProrated && data.unitAmount !== undefined && setProratedAmount) {
        setProratedAmount(data.unitAmount);
        
        toast({
          title: "Prorated Amount",
          description: `You'll be charged a prorated amount of $${data.unitAmount.toFixed(2)} based on your existing membership.`,
          variant: "default",
        });
      }
      
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      console.log("Payment intent created:", data.paymentIntentId);
    } catch (error: any) {
      console.error("Payment setup error:", error);
      setNetworkError(error.message || "There was a problem setting up the payment");
      toast({
        title: "Payment Error",
        description: error.message || "There was a problem setting up the payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleSubmit };
};

export default useFormSubmission;
