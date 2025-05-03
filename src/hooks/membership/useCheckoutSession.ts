
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

  /**
   * Main function for handling the "Become a Member" flow
   */
  const createCheckoutSession = async (
    email: string,
    firstName: string,
    lastName: string,
    phone: string | null = null,
    address: string | null = null,
    options = {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true,
    }
  ) => {
    try {
      const fullName = `${firstName} ${lastName}`;

      // Step 1: Check if user exists and has active membership
      // Using a function invocation instead of direct admin API calls
      if (options.checkExisting) {
        // Add timestamp to prevent caching issues
        const timestamp = new Date().getTime();
        const { data, error } = await supabase.functions.invoke('check-membership-status', {
          body: { email, timestamp },
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (error) throw new Error("Failed to check membership status");

        if (data.userExists && data.active) {
          toast({
            title: "Already a Member",
            description: "You already have an active membership. Please log in to continue.",
            variant: "default"
          });
          window.location.href = "/login";
          return;
        } else {
          const membershipFee = 25.00;
          const proratedAmount = data.proratedAmount || membershipFee;

          return await startCheckout(
            email, 
            fullName, 
            phone, 
            address, 
            proratedAmount,
            options
          );
        }
      } else {
        // Skip existing user check, just proceed with checkout
        const membershipFee = 25.00;
        return await startCheckout(
          email, 
          fullName, 
          phone, 
          address, 
          membershipFee,
          options
        );
      }
    } catch (error: any) {
      console.error("Error handling membership flow:", error);
      throw error;
    }
  };

  const startCheckout = async (
    email: string,
    name: string,
    phone: string | null,
    address: string | null,
    amount: number,
    options = {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
    }
  ) => {
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
          amount,
          stripeMode,
          redirectToCheckout: true,
          createMembershipRecord: true,
          createUser: options.createUser,
          sendPasswordEmail: options.sendPasswordEmail,
          sendInvoiceEmail: options.sendInvoiceEmail,
          timestamp: new Date().getTime()
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create checkout session");
    }

    if (result.success) {
      toast({
        title: "Payment Success",
        description: "A confirmation email and invoice has been sent.",
        variant: "success"
      });
      window.location.href = "/dashboard";
    } else {
      toast({
        title: "Payment Incomplete",
        description: "A payment link has been emailed to you.",
        variant: "destructive"
      });
    }

    return result;
  };

  return {
    createCheckoutSession
  };
};

export default useCheckoutSession;
