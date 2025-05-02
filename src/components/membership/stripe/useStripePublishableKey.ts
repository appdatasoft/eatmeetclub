
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useStripePublishableKey = () => {
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { toast } = useToast();

  // Fetch the Stripe publishable key from the server
  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/get-stripe-publishable-key`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache"
            }
          }
        );
        
        if (!response.ok) {
          // If response is not ok, extract error message or use default
          let errorMessage = "Failed to fetch Stripe key";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error("Error parsing error response:", e);
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        if (data.publishableKey) {
          setStripePublishableKey(data.publishableKey);
          // Reset retry count on success
          setRetryCount(0);
        } else {
          throw new Error("No Stripe publishable key returned");
        }
      } catch (err: any) {
        console.error("Error fetching Stripe key:", err);
        setError(err.message || "Failed to load Stripe");
        
        // Only show toast on first error or when retry count is a multiple of 3
        if (retryCount === 0 || retryCount % 3 === 0) {
          toast({
            title: "Payment System Error",
            description: "We're having trouble connecting to our payment system. Please refresh the page or try again later.",
            variant: "destructive",
          });
        }
        
        // Retry logic - increase retry count and try again if under max retries (5)
        if (retryCount < 5) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            console.log(`Retrying Stripe key fetch (attempt ${retryCount + 1})...`);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        } else {
          // After 5 retries, provide fallback option
          // If this is a development environment, consider using a hardcoded test key
          if (import.meta.env.DEV) {
            console.log("Development environment detected. Using fallback test key.");
            setStripePublishableKey("pk_test_fallback_for_development_only");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStripeKey();
  }, [toast, retryCount]);

  return { stripePublishableKey, isLoading, error };
};
