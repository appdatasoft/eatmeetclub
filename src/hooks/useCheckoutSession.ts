
import { useState } from "react";
import { createCheckoutSession } from "@/lib/createCheckoutSession";

interface CheckoutParams {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  stripeMode?: "test" | "live";
  eventId?: string;
  quantity?: number;
}

export function useCheckoutSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (params: CheckoutParams) => {
    setIsLoading(true);
    setError(null);

    try {
      // Add logging to help debug issues
      console.log("Starting checkout with params:", params);
      
      const { url, error } = await createCheckoutSession(params);

      if (error) {
        console.error("Checkout session creation error:", error);
        throw new Error(error);
      }
      
      if (url) {
        console.log("Redirecting to checkout URL:", url);
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }

      return { success: true };
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading, error };
}
