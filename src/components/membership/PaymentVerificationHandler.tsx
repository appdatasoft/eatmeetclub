
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePaymentVerification } from "@/hooks/membership/usePaymentVerification";

interface PaymentVerificationHandlerProps {
  sessionId: string | null;
  paymentSuccess: boolean;
  verificationProcessed: boolean;
  setVerificationProcessed: (value: boolean) => void;
}

const PaymentVerificationHandler: React.FC<PaymentVerificationHandlerProps> = ({
  sessionId,
  paymentSuccess,
  verificationProcessed,
  setVerificationProcessed
}) => {
  const { toast } = useToast();

  // Effect to verify successful Stripe checkout completion
  useEffect(() => {
    const verifyCheckoutCompletion = async () => {
      // Add verification flag to prevent multiple verification attempts
      if (sessionId && paymentSuccess && !verificationProcessed) {
        setVerificationProcessed(true);
        
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
          
          toast({
            title: "Verifying payment",
            description: "Please wait while we confirm your membership...",
          });
          
          // Call the verify endpoint to confirm subscription
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId: sessionId,
                email: storedEmail,
                name: storedName,
                phone: storedPhone || null,
                address: storedAddress || null,
                isSubscription: true
              }),
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Payment verification failed");
          }
          
          const responseData = await response.json();
          
          if (responseData.success) {
            // Clean up localStorage
            localStorage.removeItem('signup_email');
            localStorage.removeItem('signup_name');
            localStorage.removeItem('signup_phone');
            localStorage.removeItem('signup_address');
            
            toast({
              title: "Payment successful!",
              description: "Your membership has been activated. Check your email for login instructions.",
            });
          } else {
            throw new Error(responseData.message || "Payment verification failed");
          }
        } catch (error: any) {
          console.error("Error verifying checkout completion:", error);
          
          toast({
            title: "Payment verification failed",
            description: error.message || "There was a problem verifying your payment",
            variant: "destructive",
          });
        }
      }
    };
    
    verifyCheckoutCompletion();
  }, [sessionId, paymentSuccess, verificationProcessed, toast, setVerificationProcessed]);

  return null; // This component doesn't render anything
};

export default PaymentVerificationHandler;
