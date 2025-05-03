
import { useBackupEmail } from "../useBackupEmail";
import { useInvoiceEmail } from "../useInvoiceEmail";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling backup processes when verification fails
 */
export const useBackupProcessing = () => {
  const { sendDirectBackupEmail } = useBackupEmail();
  const { sendInvoiceEmail } = useInvoiceEmail();
  const { toast } = useToast();
  
  /**
   * Handle simplified verification as a fallback
   */
  const handleSimplifiedVerification = async (
    paymentId: string,
    email: string,
    name: string,
    sendVerificationRequest: any
  ) => {
    console.log("Attempting simplified verification");
    
    try {
      // Wait a moment before trying simplified verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await sendVerificationRequest(paymentId, email, name, {
        simplifiedVerification: true,
        safeMode: true,
        retry: false,
        forceSendEmails: true
      });
      
      if (result.success) {
        console.log("Simplified verification successful");
        return true;
      }
      
      return false;
    } catch (simplifiedError) {
      console.error("Simplified verification failed:", simplifiedError);
      return false;
    }
  };
  
  /**
   * Send backup emails when verification fails
   */
  const sendBackupEmails = async (paymentId: string, email: string, name: string) => {
    console.log("Sending backup emails");
    
    try {
      // Send direct backup email
      await sendDirectBackupEmail(email, name, paymentId);
      
      // Send welcome email with invoice link
      await sendInvoiceEmail(paymentId, email, name);
      
      return true;
    } catch (error) {
      console.error("Failed to send backup emails:", error);
      return false;
    }
  };
  
  /**
   * Show appropriate toast messages based on verification result
   */
  const showVerificationToasts = (result: any) => {
    if (result.passwordEmailSent) {
      toast({
        title: "Account activated!",
        description: "Check your email for instructions to set your password.",
      });
    } else if (result.membershipCreated) {
      toast({
        title: "Membership activated!",
        description: "Your membership has been successfully activated. Check your email for details.",
      });
    } else if (result.simplifiedVerification) {
      toast({
        title: "Membership confirmed!",
        description: "Your membership is being processed. Check your email shortly for account details.",
      });
    } else {
      toast({
        title: "Payment successful!",
        description: "Your membership has been activated. Check your email for login instructions.",
      });
    }
  };
  
  return {
    handleSimplifiedVerification,
    sendBackupEmails,
    showVerificationToasts
  };
};
