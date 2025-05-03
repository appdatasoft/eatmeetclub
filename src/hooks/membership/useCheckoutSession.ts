
// src/hooks/membership/useCheckoutSession.ts
import { useInvoiceEmail } from "./useInvoiceEmail";
import { useToast } from "@/hooks/use-toast";
import { useStripeMode } from "@/hooks/membership/useStripeMode";

interface CheckoutOptions {
  createUser: boolean;
  sendPasswordEmail: boolean;
  sendInvoiceEmail: boolean;
  checkExisting: boolean;
}

interface CheckoutResponse {
  url?: string;
  success: boolean;
  error?: string;
}

/**
 * Hook for creating checkout sessions and onboarding members
 */
export const useCheckoutSession = () => {
  const { checkActiveMembership } = useInvoiceEmail();
  const { toast } = useToast();
  const { mode: stripeMode } = useStripeMode();

  const createCheckoutSession = async (
    email: string,
    name: string,
    phone: string | null = null,
    address: string | null = null,
    options: CheckoutOptions
  ): Promise<CheckoutResponse> => {
    try {
      // Step 1: Call backend function to create or invite user
      const userCheck = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-or-invite-user`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache" 
        },
        body: JSON.stringify({ email })
      });
      
      // Check for HTTP errors from the user check
      if (!userCheck.ok) {
        const errorText = await userCheck.text();
        console.error("User check API error:", errorText);
        throw new Error(`User check failed: ${userCheck.status}`);
      }
      
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
        return { success: false };
      }

      // Step 3: Determine fee
      const membershipFee = 25.0;
      const amount = membership?.proratedAmount || membershipFee;

      // Step 4: Call create-membership-checkout function
      console.log("Calling create-membership-checkout with data:", {
        email,
        name,
        phone,
        address,
        amount,
        stripeMode,
        redirectToCheckout: true,
        ...options
      });
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
          },
          body: JSON.stringify({
            email,
            name,
            phone,
            address,
            amount,
            stripeMode,
            redirectToCheckout: true,
            ...options
          })
        }
      );

      console.log("Response from create-membership-checkout:", response.status);

      // Handle non-200 responses
      if (!response.ok) {
        let errorMessage = `API returned status ${response.status}`;
        
        try {
          const contentType = response.headers.get('Content-Type');
          console.log("Response content type:", contentType);
          
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorMessage = errorJson.error || errorMessage;
          } else {
            const errorText = await response.text();
            console.error("Non-JSON response received:", errorText.substring(0, 200));
            if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
              errorMessage = "Server returned HTML instead of JSON. This usually indicates a CORS issue or a server error.";
            } else {
              errorMessage = `Invalid response format: ${errorText.substring(0, 100)}`;
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        
        throw new Error(errorMessage);
      }

      // Parse response
      const contentType = response.headers.get('Content-Type');
      console.log("Success response content type:", contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error("Invalid content type on success, received:", contentType, "Response:", responseText.substring(0, 200));
        throw new Error("Server returned non-JSON response. Please check server logs.");
      }
      
      const data = await response.json();
      console.log("Checkout session response data:", data);
      
      if (!data.success) {
        console.error("Checkout failed:", data);
        toast({
          title: "Checkout failed",
          description: data.error || "Unable to start payment. Please try again.",
          variant: "destructive"
        });
        return { success: false, error: data.error || "Checkout failed" };
      }

      if (!data.url) {
        console.error("Checkout missing URL:", data);
        toast({
          title: "Checkout failed",
          description: "Unable to start payment. Please try again.",
          variant: "destructive"
        });
        return { success: false, error: "No checkout URL returned" };
      }

      console.log("Checkout session created:", data);
      
      // Redirect to Stripe checkout page
      window.location.href = data.url;
      
      return { success: true, url: data.url };
      
    } catch (error: any) {
      console.error("createCheckoutSession error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  return {
    createCheckoutSession
  };
};

export default useCheckoutSession;
