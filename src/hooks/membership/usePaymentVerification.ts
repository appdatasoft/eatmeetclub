
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentVerificationProps {
  setIsProcessing: (value: boolean) => void;
}

export const usePaymentVerification = ({ setIsProcessing }: PaymentVerificationProps) => {
  const { toast } = useToast();

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
        
        return true;
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
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { verifyPayment };
};

export default usePaymentVerification;
