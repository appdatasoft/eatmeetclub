
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
      // Add verification flag to prevent multiple verification attempts
      if (sessionId && paymentSuccess && !verificationProcessed && !isVerifying) {
        setVerificationProcessed(true);
        
        try {
          toast({
            title: "Verifying payment",
            description: "Please wait while we confirm your membership...",
          });
          
          // Use the reusable payment verification hook
          const success = await verifyPayment(sessionId);
          
          if (success) {
            console.log("Payment verified successfully");
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
  }, [sessionId, paymentSuccess, verificationProcessed, toast, setVerificationProcessed, verifyPayment, isVerifying]);

  return null; // This component doesn't render anything
};

export default PaymentVerificationHandler;
