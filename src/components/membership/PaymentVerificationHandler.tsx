
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [isVerifying, setIsVerifying] = useState(false);

  // Effect to verify successful Stripe checkout completion
  useEffect(() => {
    const verifyCheckoutCompletion = async () => {
      // Add verification flag to prevent multiple verification attempts
      if (sessionId && paymentSuccess && !verificationProcessed && !isVerifying) {
        setVerificationProcessed(true);
        setIsVerifying(true);
        
        try {
          // Get user details from localStorage
          const storedEmail = localStorage.getItem('signup_email');
          const storedName = localStorage.getItem('signup_name');
          const storedPhone = localStorage.getItem('signup_phone');
          const storedAddress = localStorage.getItem('signup_address');
          
          if (!storedEmail) {
            throw new Error("Missing email for payment verification");
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
                name: storedName || "Guest User",
                phone: storedPhone || null,
                address: storedAddress || null,
                isSubscription: true
              }),
            }
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = "Payment verification failed";
            
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              console.error("Failed to parse error response:", errorText);
            }
            
            throw new Error(errorMessage);
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
        } finally {
          setIsVerifying(false);
        }
      }
    };
    
    verifyCheckoutCompletion();
  }, [sessionId, paymentSuccess, verificationProcessed, toast, setVerificationProcessed]);

  return null; // This component doesn't render anything
};

export default PaymentVerificationHandler;
