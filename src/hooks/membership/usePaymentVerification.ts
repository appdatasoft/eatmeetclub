
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentVerificationProps {
  setIsProcessing: (value: boolean) => void;
}

export const usePaymentVerification = ({ setIsProcessing }: PaymentVerificationProps) => {
  const { toast } = useToast();
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPayment = async (paymentId: string) => {
    // Prevent multiple verification attempts
    if (isVerifying) {
      console.log("Payment verification already in progress, skipping");
      return false;
    }
    
    setIsVerifying(true);
    setIsProcessing(true);
    setVerificationError(null);
    
    try {
      // Get user details from localStorage
      const storedEmail = localStorage.getItem('signup_email');
      const storedName = localStorage.getItem('signup_name');
      const storedPhone = localStorage.getItem('signup_phone');
      const storedAddress = localStorage.getItem('signup_address');
      
      if (!storedEmail) {
        throw new Error("Missing email for payment verification");
      }
      
      if (!storedName) {
        throw new Error("Missing name for payment verification");
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
      
      // Capture response text in case it's not valid JSON
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Error parsing response:", error, responseText);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}...`);
      }
      
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
      setVerificationError(error.message || "There was a problem verifying your payment");
      toast({
        title: "Error",
        description: error.message || "There was a problem verifying your payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
      setIsVerifying(false);
    }
  };

  return { verifyPayment, verificationError, isVerifying };
};

export default usePaymentVerification;
