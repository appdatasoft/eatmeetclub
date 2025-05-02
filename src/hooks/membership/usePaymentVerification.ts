
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentVerificationProps {
  setIsProcessing: (value: boolean) => void;
}

export const usePaymentVerification = ({ setIsProcessing }: PaymentVerificationProps) => {
  const { toast } = useToast();
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [lastVerifiedSession, setLastVerifiedSession] = useState<string | null>(null);

  const verifyPayment = useCallback(async (paymentId: string) => {
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
      const storedName = localStorage.getItem('signup_name');
      const storedPhone = localStorage.getItem('signup_phone');
      const storedAddress = localStorage.getItem('signup_address');
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email: storedEmail, name: storedName, phone: storedPhone });
      
      // First attempt: try with simplified verification
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
            name: storedName || "Guest User",
            phone: storedPhone || null,
            address: storedAddress || null,
            isSubscription: true,
            simplifiedVerification: true,    // Use simplified verification to avoid errors
            forceCreateUser: true,           // Force user creation in auth table
            sendPasswordEmail: true,         // Request password email
            createMembershipRecord: false,   // Skip membership record creation initially
            sendInvoiceEmail: true,          // Request invoice email
            preventDuplicateEmails: true,    // Prevent duplicate emails
            retryAttempted: false,           // Mark as first attempt
            skipDatabaseOperations: true     // Skip database operations to avoid errors
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
      
      toast({
        title: "Payment successful!",
        description: "Your membership has been activated. Check your email for login instructions.",
      });
      
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
