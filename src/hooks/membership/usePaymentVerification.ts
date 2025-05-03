
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBackupEmail } from "./useBackupEmail";
import { useInvoiceEmail } from "./useInvoiceEmail";

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
  forceSendEmails?: boolean;
}

export const usePaymentVerification = ({ setIsProcessing }: PaymentVerificationProps) => {
  const { toast } = useToast();
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [lastVerifiedSession, setLastVerifiedSession] = useState<string | null>(null);
  
  const { sendDirectBackupEmail } = useBackupEmail();
  const { sendInvoiceEmail } = useInvoiceEmail();
  
  const verifyPayment = useCallback(async (paymentId: string, options: VerificationOptions = {}) => {
    // Additional debug logging
    console.log("verifyPayment called with options:", options);
    console.log("Current state:", { isVerifying, verificationAttempts, lastVerifiedSession });
    
    // Allow forcing verification even for repeated session IDs if forceSendEmails is true
    const bypassDuplicationCheck = options.forceSendEmails === true;
    
    // Check if we already verified this session and aren't bypassing duplicate checks
    if (lastVerifiedSession === paymentId && !bypassDuplicationCheck) {
      console.log("This session ID has already been verified:", paymentId);
      return true; // Return success to prevent retries
    }
    
    // Prevent multiple verification attempts running simultaneously
    if (isVerifying && !bypassDuplicationCheck) {
      console.log("Payment verification already in progress, skipping");
      return false;
    }
    
    // Allow bypassing retry limits when forceSendEmails is true
    if (verificationAttempts >= (options.maxRetries || 3) && !bypassDuplicationCheck) {
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
        title: "Email missing",
        description: "Unable to find your email information. Please try the signup process again.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsVerifying(true);
    setIsProcessing(true);
    setVerificationError(null);
    setVerificationAttempts(prev => prev + 1);
    
    // Only store the session ID if we aren't bypassing duplicate checks
    if (!bypassDuplicationCheck) {
      setLastVerifiedSession(paymentId);
    }
    
    try {
      // Get user details from localStorage
      const storedName = localStorage.getItem('signup_name') || storedEmail.split('@')[0] || 'Member';
      const storedPhone = localStorage.getItem('signup_phone');
      const storedAddress = localStorage.getItem('signup_address');
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email: storedEmail, name: storedName, phone: storedPhone });
      console.log("Verification options:", options);
      
      // Add timestamp to request to help bypass caching
      const timestamp = new Date().getTime();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment?t=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
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
            preventDuplicateEmails: options.forceSendEmails ? false : (options.preventDuplicateEmails !== false), // Default to true unless forced
            simplifiedVerification: options.simplifiedVerification === true, // Provide a simpler verification if needed
            safeMode: options.safeMode === true, // Minimal database operations mode
            forceSend: options.forceSendEmails === true
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
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Try again with simplified verification
          const simplifiedResult = await verifyPayment(paymentId, {
            ...options,
            simplifiedVerification: true,
            safeMode: true,
            retry: false, // Prevent infinite recursion
            forceSendEmails: true // Force sending emails in simplified mode
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
          description: "Your membership has been successfully activated. Check your email for details.",
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
            await sendInvoiceEmail(paymentId, storedEmail, storedName);
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
      
      // Try the simplified verification as a fallback if not already using it
      if (!options.simplifiedVerification && options.retry) {
        console.log("Error encountered, trying simplified verification");
        try {
          // Wait a moment before trying simplified verification
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const fallbackResult = await verifyPayment(paymentId, {
            ...options,
            simplifiedVerification: true,
            safeMode: true, 
            retry: false,
            forceSendEmails: true
          });
          
          if (fallbackResult) {
            console.log("Fallback verification successful");
            return true;
          }
        } catch (fallbackError) {
          console.error("Fallback verification also failed:", fallbackError);
        }
      }
      
      // More descriptive toast message
      toast({
        title: "Verification issue",
        description: "We had trouble completing your membership setup. Your payment was received. Please check your email or contact support.",
        variant: "destructive",
      });
      
      // Attempt direct email send as last resort
      try {
        console.log("Attempting direct backup email");
        const storedName = localStorage.getItem('signup_name') || storedEmail.split('@')[0] || 'Member';
        await sendDirectBackupEmail(storedEmail, storedName, paymentId);
      } catch (directEmailError) {
        console.error("Direct backup email failed:", directEmailError);
      }
      
      return false;
    } finally {
      setIsProcessing(false);
      setIsVerifying(false);
    }
  }, [toast, isVerifying, verificationAttempts, lastVerifiedSession, setIsProcessing, sendInvoiceEmail, sendDirectBackupEmail]);

  return { verifyPayment, verificationError, isVerifying, verificationAttempts };
};

export default usePaymentVerification;
