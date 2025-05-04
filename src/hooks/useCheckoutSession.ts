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
      const { url, error } = await createCheckoutSession(params);

      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading, error };
}
