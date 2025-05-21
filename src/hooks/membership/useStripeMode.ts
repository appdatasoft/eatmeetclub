
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStripeMode = () => {
  const [mode, setMode] = useState<'test' | 'live' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStripeMode = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get stripe mode from app_config table instead of using RPC
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'STRIPE_MODE')
        .single();
      
      if (error) {
        console.error("Error fetching Stripe mode:", error);
        setError("Failed to check payment mode");
        // Default to test mode for safety
        setMode('test');
        return;
      }
      
      // Determine the mode from the value
      const stripeMode = data?.value === 'live' ? 'live' : 'test';
      setMode(stripeMode);
      
      console.log("Stripe mode fetched:", stripeMode);
    } catch (err) {
      console.error("Error in fetchStripeMode:", err);
      setError("Failed to check payment mode");
      // Default to test mode for safety
      setMode('test');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStripeMode = async (newMode: 'test' | 'live') => {
    try {
      // Get the current user session - need to be authenticated for this
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error("You must be logged in to update Stripe mode");
      }
      
      // Update the app_config directly instead of using RPC
      const { error } = await supabase
        .from('app_config')
        .update({ value: newMode })
        .eq('key', 'STRIPE_MODE');
      
      if (error) {
        console.error("Error updating Stripe mode:", error);
        throw new Error("Failed to update Stripe mode");
      }
      
      setMode(newMode);
      return true;
    } catch (err: any) {
      console.error("Error in updateStripeMode:", err);
      setError(err.message || "Failed to update Stripe mode");
      toast({
        title: "Error",
        description: err.message || "Failed to update Stripe mode",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleRetryStripeCheck = () => {
    fetchStripeMode();
  };

  useEffect(() => {
    fetchStripeMode();
  }, [fetchStripeMode]);

  return {
    mode,
    isLoading,
    error,
    updateStripeMode,
    handleRetryStripeCheck,
    isStripeTestMode: mode === 'test'
  };
};

export default useStripeMode;
