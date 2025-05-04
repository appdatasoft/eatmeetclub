
import { useState } from "react";
import { createCheckoutSession } from "@/lib/createCheckoutSession";

export function useCheckoutSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (params: {
    email: string;
    name?: string;
    phone?: string;
    address?: string;
    stripeMode?: "test" | "live";
  }) => {
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
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading, error };
}
