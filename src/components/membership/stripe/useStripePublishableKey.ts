
import { useState, useEffect } from "react";

/**
 * Hook to get the Stripe publishable key
 * Handles loading state and errors
 */
export const useStripePublishableKey = () => {
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 3;

  const fetchKey = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get from localStorage if available to avoid multiple requests
      const cachedKey = localStorage.getItem('stripe_publishable_key');
      
      if (cachedKey) {
        console.log("Using cached Stripe publishable key");
        setStripePublishableKey(cachedKey);
        setIsLoading(false);
        return;
      }

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
        throw new Error(`Failed to fetch Stripe key. Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.key) {
        throw new Error("No publishable key received");
      }
      
      // Cache key in localStorage
      localStorage.setItem('stripe_publishable_key', data.key);
      
      setStripePublishableKey(data.key);
    } catch (err: any) {
      console.error("Error fetching Stripe publishable key:", err);
      setError(err.message || "Failed to load payment configuration");
      
      // If we have less than max retries, try again after delay
      if (retryCount < maxRetries) {
        setTimeout(() => setRetryCount(prev => prev + 1), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Retry logic
  useEffect(() => {
    if (retryCount > 0) {
      fetchKey();
    }
  }, [retryCount]);

  // Initial fetch
  useEffect(() => {
    fetchKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = () => {
    setRetryCount(0);
    fetchKey();
  };

  return { 
    stripePublishableKey, 
    isLoading, 
    error,
    retry
  };
};
