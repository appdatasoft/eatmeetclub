
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
  const [emailCheckDone, setEmailCheckDone] = useState(false);
  const { verifyPayment, isVerifying } = usePaymentVerification({
    setIsProcessing
  });

  // Effect to verify successful Stripe checkout completion
  useEffect(() => {
    // Only run this check once
    if (emailCheckDone) return;
    
    const verifyCheckoutCompletion = async () => {
      // Verify only once with valid session ID when success parameter is present
      if (sessionId && paymentSuccess && !verificationProcessed && !isVerifying) {
        console.log("Starting payment verification with session ID:", sessionId);
        
        try {
          // Check if we have the required email in localStorage first
          const storedEmail = localStorage.getItem('signup_email');
          const storedName = localStorage.getItem('signup_name');
          
          // Mark email check as done to prevent repeated checks
          setEmailCheckDone(true);
          
          if (!storedEmail) {
            console.error("Missing email for payment verification in PaymentVerificationHandler");
            toast({
              title: "Verification failed",
              description: "Missing email for payment verification. Please try signing up again.",
              variant: "destructive",
            });
            
            // Mark as processed to prevent further attempts when email is missing
            setVerificationProcessed(true);
            return;
          }
          
          if (!storedName) {
            console.log("Missing name for payment verification, but can continue with default");
          }
          
          toast({
            title: "Verifying payment",
            description: "Please wait while we confirm your membership...",
          });
          
          // Mark verification as processed to prevent duplicate attempts
          setVerificationProcessed(true);
          
          // Use the verification hook
          const success = await verifyPayment(sessionId);
          
          if (success) {
            console.log("Payment verified successfully");
            // Clear checkout initiated flag after successful verification
            sessionStorage.removeItem('checkout_initiated');
            
            toast({
              title: "Welcome to our membership!",
              description: "Your account has been activated. Please check your email for login instructions.",
            });
          } else {
            console.log("Payment verification returned failure");
            // Don't clear checkout flag on failure to allow retry
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
        setEmailCheckDone(true);
      } else if (!sessionId && paymentSuccess) {
        console.log("Payment success flag present but no session ID available");
        setEmailCheckDone(true);
      }
    };
    
    verifyCheckoutCompletion();
  }, [sessionId, paymentSuccess, verificationProcessed, toast, setVerificationProcessed, verifyPayment, isVerifying, emailCheckDone]);

  return null; // This component doesn't render anything
};

export default PaymentVerificationHandler;
