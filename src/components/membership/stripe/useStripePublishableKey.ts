
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useStripePublishableKey = () => {
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch the Stripe publishable key from the server
  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/get-stripe-publishable-key`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch Stripe key");
        }
        
        const data = await response.json();
        if (data.publishableKey) {
          setStripePublishableKey(data.publishableKey);
        } else {
          throw new Error("No Stripe publishable key returned");
        }
      } catch (err: any) {
        console.error("Error fetching Stripe key:", err);
        setError(err.message || "Failed to load Stripe");
        toast({
          title: "Configuration Error",
          description: "Failed to load payment system. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStripeKey();
  }, [toast]);

  return { stripePublishableKey, isLoading, error };
};
