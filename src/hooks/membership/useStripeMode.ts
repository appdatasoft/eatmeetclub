
import { useState, useEffect } from 'react';
import { fetchStripeMode } from '@/utils/stripeApi';
import { getStripeMode } from '@/utils/getStripeMode';

/**
 * Hook to get and manage the current Stripe mode
 */
export const useStripeMode = () => {
  const [mode, setMode] = useState<"test" | "live">(getStripeMode());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadStripeMode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Checking Stripe mode from API...");
        const result = await fetchStripeMode();
        
        if (result.error) {
          console.warn("Error fetching Stripe mode:", result.error);
          setError(`Failed to fetch Stripe mode: ${result.error}`);
          // Fall back to local mode
          setMode(getStripeMode());
        } else {
          console.log("Stripe mode from API:", result.mode);
          setMode(result.mode);
          // Cache the mode in localStorage for offline usage
          localStorage.setItem('stripe_mode', result.mode);
        }
      } catch (err) {
        console.error("Error in useStripeMode:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fall back to local mode
        setMode(getStripeMode());
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load the stripe mode when the hook is first used
    loadStripeMode();
  }, []);
  
  return { 
    mode, 
    isLoading,
    error,
    isTestMode: mode !== "live"
  };
};
