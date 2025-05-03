
// src/hooks/membership/useCheckoutSession.ts
import { useInvoiceEmail } from "./useInvoiceEmail";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
          const proratedAmount = membership.proratedAmount || 25.0;

          if (proratedAmount <= 0) {
            toast({
              title: "Active Membership",
              description: "You already have an active membership that doesn't need renewal yet.",
              variant: "default",
            });
            throw new Error("User already has an active membership");
          }

          if (membership.remainingDays < 15) {
            toast({
              title: "Existing Membership",
              description: `You already have a membership with ${membership.remainingDays} days remaining. You'll be charged a prorated amount of $${proratedAmount.toFixed(2)}.`,
              variant: "default",
            });
          }
        }
      }

      // Get Supabase access token
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("User is not authenticated or session is missing");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email,
            name,
            phone,
            address,
            redirectToCheckout: true,
            createUser: options.createUser,
            sendPasswordEmail: options.sendPasswordEmail,
            sendInvoiceEmail: options.sendInvoiceEmail,
            forceCreateUser: options.createUser,
            createMembershipRecord: true,
            timestamp: new Date().getTime()
          })
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