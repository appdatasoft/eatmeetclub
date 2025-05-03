
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling the payment verification API request
 */
export const useVerificationRequest = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const { toast } = useToast();
  
  /**
   * Send verification request to the API
   */
  const sendVerificationRequest = async (
    paymentId: string, 
    email: string,
    name: string,
    options = {
      phone: null as string | null,
      address: null as string | null,
      isSubscription: true,
      forceCreateUser: true,
      sendPasswordEmail: true,
      createMembershipRecord: true,
      sendInvoiceEmail: true,
      preventDuplicateEmails: true,
      simplifiedVerification: false,
      safeMode: false,
      forceSendEmails: false
    }
  ) => {
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email, name, phone: options.phone });
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
            sessionId: paymentId,
            email,
            name,
            phone: options.phone || null,
            address: options.address || null,
            isSubscription: options.isSubscription,
            forceCreateUser: options.forceCreateUser,
            sendPasswordEmail: options.sendPasswordEmail,
            createMembershipRecord: options.createMembershipRecord,
            sendInvoiceEmail: options.sendInvoiceEmail,
            preventDuplicateEmails: options.forceSendEmails ? false : options.preventDuplicateEmails,
            simplifiedVerification: options.simplifiedVerification,
            safeMode: options.safeMode,
            forceSend: options.forceSendEmails
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
      return data;
    } catch (error: any) {
      console.error("Payment verification error:", error);
      setVerificationError(error.message || "There was a problem verifying your payment");
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };
  
  return {
    sendVerificationRequest,
    isVerifying,
    verificationError,
    verificationAttempts,
    setVerificationAttempts
  };
};
