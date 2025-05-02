
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import usePaymentVerification from "@/hooks/membership/usePaymentVerification"; 

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { verifyPayment, isVerifying } = usePaymentVerification({
    setIsProcessing
  });

  // Effect to verify successful Stripe checkout completion
  useEffect(() => {
    const verifyCheckoutCompletion = async () => {
      // Verify only once with valid session ID when success parameter is present
      if (sessionId && paymentSuccess && !verificationProcessed && !isVerifying) {
        console.log("Starting payment verification with session ID:", sessionId);
        setVerificationProcessed(true);
        
        try {
          toast({
            title: "Verifying payment",
            description: "Please wait while we confirm your membership...",
          });
          
          // Use the modified verification hook that doesn't need auth headers
          const success = await verifyPayment(sessionId);
          
          if (success) {
            console.log("Payment verified successfully");
            toast({
              title: "Welcome to our membership!",
              description: "Your account has been activated. Please check your email for login instructions.",
            });
          } else {
            console.log("Payment verification returned failure");
          }
        } catch (error: any) {
          console.error("Error verifying checkout completion:", error);
          
          toast({
            title: "Payment verification failed",
            description: error.message || "There was a problem verifying your payment",
            variant: "destructive",
          });
        }
      } else if (sessionId && paymentSuccess && verificationProcessed) {
        console.log("Payment verification already processed, skipping");
      } else if (!sessionId && paymentSuccess) {
        console.log("Payment success flag present but no session ID available");
      }
    };
    
    verifyCheckoutCompletion();
  }, [sessionId, paymentSuccess, verificationProcessed, toast, setVerificationProcessed, verifyPayment, isVerifying]);

  return null; // This component doesn't render anything
};

export default PaymentVerificationHandler;
