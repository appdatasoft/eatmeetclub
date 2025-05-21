
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStripePublishableKey = () => {
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch from app_config table instead of using an edge function
        const { data, error: fetchError } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'STRIPE_PUBLISHABLE_KEY')
          .single();
        
        if (fetchError) {
          console.error("Error fetching Stripe publishable key:", fetchError);
          setError("Failed to load payment system configuration");
          return;
        }
        
        if (!data?.value) {
          setError("Stripe publishable key not found in configuration");
          return;
        }
        
        setStripePublishableKey(data.value);
      } catch (err) {
        console.error("Error in fetchKey:", err);
        setError("An error occurred while loading payment system configuration");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKey();
  }, []);

  return {
    stripePublishableKey,
    isLoading,
    error
  };
};
