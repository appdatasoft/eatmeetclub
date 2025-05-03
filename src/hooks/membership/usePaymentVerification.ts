
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVerificationRequest } from "./payment-verification/useVerificationRequest";
import { useBackupProcessing } from "./payment-verification/useBackupProcessing";
import { useUserStorage } from "./payment-verification/useUserStorage";

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
  const [lastVerifiedSession, setLastVerifiedSession] = useState<string | null>(null);
  
  const {
    sendVerificationRequest,
    isVerifying,
    verificationError,
    verificationAttempts,
    setVerificationAttempts
  } = useVerificationRequest();
  
  const {
    handleSimplifiedVerification,
    sendBackupEmails,
    showVerificationToasts
  } = useBackupProcessing();
  
  const { getUserDetails, clearUserDetails } = useUserStorage();
  
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
    const { email, name, phone, address } = getUserDetails();
    if (!email) {
      console.error("Missing email for payment verification in usePaymentVerification");
      toast({
        title: "Email missing",
        description: "Unable to find your email information. Please try the signup process again.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsProcessing(true);
    
    // Only store the session ID if we aren't bypassing duplicate checks
    if (!bypassDuplicationCheck) {
      setLastVerifiedSession(paymentId);
    }
    
    try {
      const result = await sendVerificationRequest(paymentId, email, name, {
        phone,
        address,
        isSubscription: true,
        forceCreateUser: options.forceCreateUser !== false,
        sendPasswordEmail: options.sendPasswordEmail !== false,
        createMembershipRecord: options.createMembershipRecord !== false,
        sendInvoiceEmail: options.sendInvoiceEmail !== false,
        preventDuplicateEmails: options.forceSendEmails ? false : (options.preventDuplicateEmails !== false),
        simplifiedVerification: options.simplifiedVerification === true,
        safeMode: options.safeMode === true,
        forceSendEmails: options.forceSendEmails === true
      });
      
      // Show appropriate message based on response
      showVerificationToasts(result);
      
      // Clean up localStorage and sessionStorage
      clearUserDetails();
      
      return true;
    } catch (error: any) {
      console.error("Payment verification error:", error);
      
      // Try the simplified verification as a fallback if not already using it
      if (!options.simplifiedVerification && options.retry) {
        const fallbackResult = await handleSimplifiedVerification(
          paymentId,
          email,
          name,
          sendVerificationRequest
        );
        
        if (fallbackResult) {
          clearUserDetails();
          return true;
        }
      }
      
      // More descriptive toast message
      toast({
        title: "Verification issue",
        description: "We had trouble completing your membership setup. Your payment was received. Please check your email or contact support.",
        variant: "destructive",
      });
      
      // Attempt direct email send as last resort
      await sendBackupEmails(paymentId, email, name);
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [
    toast, isVerifying, verificationAttempts, lastVerifiedSession, 
    setIsProcessing, sendVerificationRequest, handleSimplifiedVerification, 
    sendBackupEmails, showVerificationToasts, getUserDetails, clearUserDetails
  ]);

  return { 
    verifyPayment,
    verificationError,
    isVerifying,
    verificationAttempts
  };
};

export default usePaymentVerification;
