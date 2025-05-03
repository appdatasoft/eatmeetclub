
import { useInvoiceEmail } from "./useInvoiceEmail";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for creating checkout sessions
 */
export const useCheckoutSession = () => {
  const { checkActiveMembership } = useInvoiceEmail();
  const { toast } = useToast();
  
  /**
   * Creates a checkout session with Stripe
   */
  const createCheckoutSession = async (
    email: string, 
    name: string, 
    phone: string | null = null, 
    address: string | null = null,
    options = {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true
    }
  ) => {
    try {
      // Check if user already has an active membership
      if (options.checkExisting) {
        const membership = await checkActiveMembership(email);
        
        if (membership) {
          // Calculate the prorated amount based on remaining days
          const proratedAmount = membership.proratedAmount || 25.00;
          
          if (proratedAmount <= 0) {
            toast({
              title: "Active Membership",
              description: "You already have an active membership that doesn't need renewal yet.",
              variant: "default",
            });
            
            throw new Error("User already has an active membership");
          }
          
          // If there are less than 15 days remaining, offer prorated price
          if (membership.remainingDays < 15) {
            toast({
              title: "Existing Membership",
              description: `You already have a membership with ${membership.remainingDays} days remaining. You'll be charged a prorated amount of $${proratedAmount.toFixed(2)}.`,
              variant: "default",
            });
          }
        }
      }
      
      // Create a checkout session with the appropriate amount
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            name,
            phone,
            address,
            redirectToCheckout: true,
            // Add metadata to help with user creation and emails
            createUser: options.createUser,
            sendPasswordEmail: options.sendPasswordEmail,
            sendInvoiceEmail: options.sendInvoiceEmail,
            // Added force flags to ensure database records are created
            forceCreateUser: options.createUser,
            createMembershipRecord: true,
            // Add timestamp to prevent caching
            timestamp: new Date().getTime()
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create checkout session");
      }
      
      return await response.json();
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  };

  return {
    createCheckoutSession
  };
};

export default useCheckoutSession;
