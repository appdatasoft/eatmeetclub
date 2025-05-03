
// src/hooks/membership/useCheckoutSession.ts
import { useInvoiceEmail } from "./useInvoiceEmail";
import { useToast } from "@/hooks/use-toast";
import { useStripeMode } from "@/hooks/membership/useStripeMode";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for creating checkout sessions and onboarding members
 */
export const useCheckoutSession = () => {
  const { checkActiveMembership } = useInvoiceEmail();
  const { toast } = useToast();
  const { mode: stripeMode } = useStripeMode();

  const createCheckoutSession = async (
    email: string,
    firstName: string,
    lastName: string,
    phone: string | null = null,
    address: string | null = null
  ) => {
    try {
      const fullName = `${firstName} ${lastName}`;

      // Step 1: Call backend function to create or invite user
      const userCheck = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-or-invite-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const userResult = await userCheck.json();

      // Step 2: Check if user has active membership
      const membership = await checkActiveMembership(email);

      if (membership?.active) {
        toast({
          title: "Already a Member",
          description: "You already have an active membership. Please log in to continue.",
          variant: "default"
        });
        window.location.href = "/login";
        return;
      }

      // Step 3: Determine fee
      const membershipFee = 25.0;
      const amount = membership?.proratedAmount || membershipFee;

      // Step 4: Call create-membership-checkout function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: fullName,
            phone,
            address,
            amount,
            stripeMode,
            redirectToCheckout: true
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        console.error("Checkout failed:", data);
        toast({
          title: "Checkout failed",
          description: data.error || "Unable to start payment. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log("Redirecting to Stripe:", data.url);
      window.location.href = data.url;

    } catch (error: any) {
      console.error("createCheckoutSession error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  return {
    createCheckoutSession
  };
};

export default useCheckoutSession;
