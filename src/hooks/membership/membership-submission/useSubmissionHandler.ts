
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAccountCreation } from "../useAccountCreation";
import { useWelcomeEmail } from "../useWelcomeEmail";
import { useCheckoutSession } from "../useCheckoutSession";
import { useUserStorage } from "../useUserStorage";
import { useSubmissionStorage } from "./useSubmissionStorage";
import { useSubmissionValidation } from "./useSubmissionValidation";

/**
 * Hook for handling membership submission
 */
export const useSubmissionHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Import refactored hooks
  const { generateTemporaryPassword, createUserAccount } = useAccountCreation();
  const { sendWelcomeEmail } = useWelcomeEmail();
  const { createCheckoutSession } = useCheckoutSession();
  const { storeUserDetails, verifyStoredDetails } = useUserStorage();
  const { isLoading, isSubmitted, setIsLoading, setIsSubmitted, isSubmissionInProgress, markCheckoutInitiated } = useSubmissionStorage();
  const { validateSubmissionFields, showSubmissionInProgressToast } = useSubmissionValidation();

  /**
   * Handle membership form submission
   */
  const handleMembershipSubmit = async (values: any) => {
    // Prevent multiple submissions
    if (isSubmissionInProgress()) {
      showSubmissionInProgressToast();
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { name, email, phone, address } = values;
      
      // Validate required fields
      validateSubmissionFields({ email, name });
      
      console.log("Storing user details in localStorage and sessionStorage:", { email, name, phone, address });
      
      // Store user details
      storeUserDetails(email, name, phone, address);
      
      // Generate a temporary password for the user
      const tempPassword = generateTemporaryPassword();
      
      // Create user account or verify if it already exists
      const userResult = await createUserAccount(email, tempPassword, name);
      
      if (!userResult.success) {
        throw new Error(userResult.error || "Failed to create user account");
      }
      
      // Send welcome email with password reset link
      if (!userResult.existed) {
        const emailSent = await sendWelcomeEmail(email, name);
        if (emailSent) {
          console.log("Welcome email sent successfully");
        } else {
          console.warn("Welcome email could not be sent, continuing with checkout");
        }
      }
      
      // Create a checkout session
      const checkoutResult = await createCheckoutSession(
        email, 
        name, 
        phone, 
        address, 
        {
          createUser: true,
          sendPasswordEmail: true,
          sendInvoiceEmail: true,
          checkExisting: true
        }
      );
      
      console.log("Checkout session created:", checkoutResult);
      
      if (checkoutResult.success && checkoutResult.url) {
        // Mark checkout as initiated to prevent duplicate submissions
        markCheckoutInitiated();
        
        // Verify stored details before redirect
        verifyStoredDetails(email);
        
        // Redirect directly to Stripe checkout URL
        window.location.href = checkoutResult.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem starting the checkout process",
        variant: "destructive",
      });
      
      // Don't clear localStorage on error - we might need to retry
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSubmitted,
    handleMembershipSubmit,
    setIsSubmitted
  };
};

export default useSubmissionHandler;
