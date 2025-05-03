
import { useState, useEffect, useCallback } from 'react';
import { fetchStripeMode } from '@/utils/stripeApi';
import { getStripeMode, isStripeTestMode as getIsStripeTestMode } from '@/utils/getStripeMode';

/**
 * Hook to get and manage the current Stripe mode
 */
export const useStripeMode = () => {
  const [mode, setMode] = useState<"test" | "live">(getStripeMode());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add explicit flag for test mode
  const isTestMode = mode !== "live";
  // Add explicit flag for error state that can be checked
  const stripeCheckError = error !== null;
  // Add isStripeTestMode as an alias for isTestMode for consistency
  const isStripeTestMode = isTestMode;
  
  const handleRetryStripeCheck = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Retrying Stripe mode check...");
      const result = await fetchStripeMode();
      
      if (result.error) {
        console.warn("Error fetching Stripe mode on retry:", result.error);
        setError(`Failed to fetch Stripe mode: ${result.error}`);
        // Fall back to local mode
        setMode(getStripeMode());
      } else {
        console.log("Stripe mode from retry:", result.mode);
        setMode(result.mode);
        // Cache the mode in localStorage for offline usage
        localStorage.setItem('stripe_mode', result.mode);
      }
    } catch (err) {
      console.error("Error in retrying Stripe mode check:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Fall back to local mode
      setMode(getStripeMode());
    } finally {
      setIsLoading(false);
    }
  }, []);
  
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
    isTestMode,
    isStripeTestMode,
    stripeCheckError,
    handleRetryStripeCheck
  };
};
