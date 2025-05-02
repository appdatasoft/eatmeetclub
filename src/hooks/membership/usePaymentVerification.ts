
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
  simplifiedVerification?: boolean;
  safeMode?: boolean;
  retry?: boolean;
  maxRetries?: number;
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
    
    // Prevent multiple verification attempts running simultaneously
    if (isVerifying) {
      console.log("Payment verification already in progress, skipping");
      return false;
    }
    
    // Limit verification attempts to prevent spam
    if (verificationAttempts >= (options.maxRetries || 3)) {
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
            preventDuplicateEmails: options.preventDuplicateEmails !== false, // Default to true
            simplifiedVerification: options.simplifiedVerification === true, // Provide a simpler verification if needed
            safeMode: options.safeMode === true, // Minimal database operations mode
          }),
        }
      );
      
      if (!response.ok) {
        // Get response text and try to parse it as JSON
        const responseText = await response.text();
        let data;
        let errorMessage = "Payment verification failed";
        
        try {
          data = JSON.parse(responseText);
          errorMessage = data.message || errorMessage;
        } catch (parseError) {
          console.error("Error parsing response:", parseError, responseText);
          errorMessage = `Invalid response: ${responseText.substring(0, 100)}...`;
        }
        
        // If retry is enabled and we haven't exceeded max attempts, try again with simplified verification
        if (options.retry && verificationAttempts < (options.maxRetries || 3)) {
          console.log("Retry enabled, attempting with simplified verification");
          
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try again with simplified verification
          const simplifiedResult = await verifyPayment(paymentId, {
            ...options,
            simplifiedVerification: true,
            safeMode: true,
            retry: false // Prevent infinite recursion
          });
          
          if (simplifiedResult) {
            console.log("Simplified verification successful");
            return true;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Get response text and parse it as JSON
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Error parsing response:", error, responseText);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}...`);
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
      } else if (data.simplifiedVerification) {
        toast({
          title: "Membership confirmed!",
          description: "Your membership is being processed. Check your email shortly for account details.",
        });
        
        // For simplified verification, trigger invoice email separately if needed
        if (data.invoiceEmailNeeded) {
          try {
            console.log("Sending invoice email separately");
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-invoice-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  sessionId: paymentId,
                  email: storedEmail,
                  name: storedName,
                  preventDuplicate: true
                }),
              }
            );
          } catch (emailError) {
            console.error("Error sending separate invoice email:", emailError);
          }
        }
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
      
      // More descriptive toast message
      toast({
        title: "Verification issue",
        description: "We had trouble completing your membership setup. Please contact support with your payment ID.",
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
