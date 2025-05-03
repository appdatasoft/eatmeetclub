
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
      // Step 1: Check if user has active membership
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

      // Step 2: Determine fee
      const membershipFee = 25.0;
      const amount = membership?.proratedAmount || membershipFee;

      // Step 3: Call create-membership-checkout function
      console.log("Calling create-membership-checkout with data:", {
        email,
        name,
        phone,
        address,
        amount,
        stripeMode,
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
          
          // Check if we have JSON response
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorMessage = errorJson.error || errorMessage;
          } else {
            // Handle non-JSON responses like HTML
            const errorText = await response.text();
            const truncatedText = errorText.substring(0, 200);
            console.error("Non-JSON response received:", truncatedText);
            
            if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
              errorMessage = "Server returned HTML instead of JSON. This usually indicates a server error.";
            } else {
              errorMessage = `Invalid response format: ${truncatedText}`;
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        
        throw new Error(errorMessage);
      }

      // Parse response as text first to check content
      const responseText = await response.text();
      let data;
      
      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        console.error("Raw response text:", responseText.substring(0, 200));
        throw new Error("Server returned invalid JSON. Please check server logs.");
      }
      
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
