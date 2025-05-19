
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getStripeMode } from '@/utils/getStripeMode';

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
      
      console.log("Fetching Stripe mode from admin_config...");
      const { data, error: fetchError } = await supabase
        .from('admin_config')
        .select('value')
        .eq('key', 'stripe_mode')
        .single();
      
      if (fetchError) {
        console.warn("Error fetching Stripe mode:", fetchError);
        setError(`Failed to fetch Stripe mode: ${fetchError.message}`);
        // Fall back to local mode
        setMode(getStripeMode());
      } else {
        console.log("Stripe mode from database:", data?.value);
        const fetchedMode = data?.value === 'live' ? 'live' : 'test';
        setMode(fetchedMode);
        // Cache the mode in localStorage for offline usage
        localStorage.setItem('stripe_mode', fetchedMode);
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
  
  // Update function to change Stripe mode
  const updateStripeMode = useCallback(async (newMode: "test" | "live") => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update the mode in the database
      const { error: updateError } = await supabase
        .from('admin_config')
        .update({ value: newMode })
        .eq('key', 'stripe_mode');
      
      if (updateError) {
        console.error("Error updating Stripe mode:", updateError);
        setError(`Failed to update Stripe mode: ${updateError.message}`);
        return false;
      }
      
      // Update the local state
      setMode(newMode);
      
      // Cache the new mode in localStorage
      localStorage.setItem('stripe_mode', newMode);
      
      return true;
    } catch (err) {
      console.error("Error updating Stripe mode:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    // Load the stripe mode when the hook is first used
    handleRetryStripeCheck();
  }, [handleRetryStripeCheck]);
  
  return { 
    mode, 
    isLoading,
    error,
    isTestMode,
    isStripeTestMode,
    stripeCheckError,
    handleRetryStripeCheck,
    updateStripeMode
  };
};
