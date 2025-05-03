
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import usePaymentVerification from "@/hooks/membership/usePaymentVerification";
import { useBackupEmail } from "@/hooks/membership/useBackupEmail";

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
  const [maxRetriesReached, setMaxRetriesReached] = useState(false);
  const { verifyPayment, isVerifying, verificationAttempts } = usePaymentVerification({
    setIsProcessing
  });
  const { sendDirectBackupEmail } = useBackupEmail();

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
              title: "Email missing",
              description: "Unable to find your email. Please try the signup process again.",
              variant: "destructive",
            });
            
            // Mark as processed to prevent further attempts when email is missing
            setVerificationProcessed(true);
            return;
          }
          
          if (!storedName) {
            console.log("Missing name for payment verification, using email as name");
            const defaultName = storedEmail.split('@')[0] || 'Member';
            localStorage.setItem('signup_name', defaultName);
          }
          
          toast({
            title: "Verifying payment",
            description: "Please wait while we confirm your membership...",
          });
          
          // Force critical parameters to ensure success:
          // 1. createMembershipRecord: true - creates record in memberships table
          // 2. sendInvoiceEmail: true - sends invoice email
          // Both processes create the records in the required tables
          const success = await verifyPayment(sessionId, {
            // Force all processes to complete even if earlier steps fail
            forceCreateUser: true,
            sendPasswordEmail: true,
            createMembershipRecord: true, // Ensures memberships record is created
            sendInvoiceEmail: true,       // Ensures invoice is sent and payment record is created
            // Use simplified verification as backup if full verification fails
            simplifiedVerification: false,
            // Set retry if first attempt fails
            retry: true,
            maxRetries: 3,
            // Force bypass any duplicate checks
            forceSendEmails: true
          });
          
          if (success) {
            console.log("Payment verified successfully");
            // Clear checkout initiated flag after successful verification
            sessionStorage.removeItem('checkout_initiated');
            
            toast({
              title: "Welcome to our membership!",
              description: "Your account has been activated. Please check your email for login instructions and invoice.",
            });
          } else if (verificationAttempts >= 3) {
            setMaxRetriesReached(true);
            console.log("Max verification attempts reached");
            
            // Show alternative message when max retries reached
            toast({
              title: "Verification taking longer than expected",
              description: "Your payment was successful. We're still processing your membership - please check your email shortly.",
            });
            
            // Send a direct email manually as fallback
            try {
              await sendDirectBackupEmail(storedEmail, storedName || 'Member', sessionId);
            } catch (emailErr) {
              console.error("Failed to send backup email:", emailErr);
            }
          } else {
            console.log("Payment verification returned failure");
            // Don't clear checkout flag on failure to allow retry
          }
          
          // Mark verification as processed to prevent duplicate attempts
          setVerificationProcessed(true);
        } catch (error: any) {
          console.error("Error verifying checkout completion:", error);
          
          toast({
            title: "Verification issue",
            description: "Your payment was successful, but we encountered an issue setting up your account. Please contact support with your payment ID.",
            variant: "destructive",
          });
          
          // Mark as processed to prevent further attempts
          setVerificationProcessed(true);
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
  }, [sessionId, paymentSuccess, verificationProcessed, toast, setVerificationProcessed, verifyPayment, isVerifying, emailCheckDone, verificationAttempts, sendDirectBackupEmail]);

  return null; // This component doesn't render anything
};

export default PaymentVerificationHandler;
