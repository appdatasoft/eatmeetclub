
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentVerificationProps {
  setIsProcessing: (value: boolean) => void;
}

interface VerificationOptions {
  forceCreateUser?: boolean;
  sendPasswordEmail?: boolean;
  createMembershipRecord?: boolean;
  sendInvoiceEmail?: boolean;
  preventDuplicateEmails?: boolean;
}

export const usePaymentVerification = ({ setIsProcessing }: PaymentVerificationProps) => {
  const { toast } = useToast();
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [lastVerifiedSession, setLastVerifiedSession] = useState<string | null>(null);

  const verifyPayment = useCallback(async (paymentId: string, options: VerificationOptions = {}) => {
    // Prevent verifying the same session ID multiple times
    if (lastVerifiedSession === paymentId) {
      console.log("This session ID has already been verified:", paymentId);
      return true; // Return success to prevent retries
    }
    
    // Prevent multiple verification attempts
    if (isVerifying) {
      console.log("Payment verification already in progress, skipping");
      return false;
    }
    
    // Limit verification attempts to prevent spam
    if (verificationAttempts >= 3) {
      console.log("Maximum verification attempts reached");
      toast({
        title: "Verification limit reached",
        description: "We're still processing your payment. Please check your email for confirmation.",
      });
      return false;
    }
    
    // Check if we have the required email in localStorage BEFORE setting any state
    const storedEmail = localStorage.getItem('signup_email');
    if (!storedEmail) {
      console.error("Missing email for payment verification in usePaymentVerification");
      toast({
        title: "Verification failed",
        description: "Missing email for payment verification. Please try signing up again.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsVerifying(true);
    setIsProcessing(true);
    setVerificationError(null);
    setVerificationAttempts(prev => prev + 1);
    setLastVerifiedSession(paymentId); // Store the session ID to prevent duplicate verifications
    
    try {
      // Get user details from localStorage
      const storedName = localStorage.getItem('signup_name') || storedEmail.split('@')[0] || 'Member';
      const storedPhone = localStorage.getItem('signup_phone');
      const storedAddress = localStorage.getItem('signup_address');
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email: storedEmail, name: storedName, phone: storedPhone });
      console.log("Verification options:", options);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paymentId,
            email: storedEmail,
            name: storedName,
            phone: storedPhone || null,
            address: storedAddress || null,
            isSubscription: true,
            forceCreateUser: options.forceCreateUser !== false,  // Default to true
            sendPasswordEmail: options.sendPasswordEmail !== false,  // Default to true
            createMembershipRecord: options.createMembershipRecord !== false, // Default to true
            sendInvoiceEmail: options.sendInvoiceEmail !== false,   // Default to true
            preventDuplicateEmails: options.preventDuplicateEmails !== false // Default to true
          }),
        }
      );
      
      // Get response text and parse it as JSON
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
      
      // Show appropriate message based on response
      if (data.passwordEmailSent) {
        toast({
          title: "Account activated!",
          description: "Check your email for instructions to set your password.",
        });
      } else if (data.membershipCreated) {
        toast({
          title: "Membership activated!",
          description: "Your membership has been successfully activated.",
        });
      } else {
        toast({
          title: "Payment successful!",
          description: "Your membership has been activated. Check your email for login instructions.",
        });
      }
      
      // Clean up localStorage and sessionStorage
      localStorage.removeItem('signup_email');
      localStorage.removeItem('signup_name');
      localStorage.removeItem('signup_phone');
      localStorage.removeItem('signup_address');
      sessionStorage.removeItem('checkout_initiated');
      
      return true;
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
  }, [toast, isVerifying, verificationAttempts, lastVerifiedSession, setIsProcessing]);

  return { verifyPayment, verificationError, isVerifying, verificationAttempts };
};

export default usePaymentVerification;
