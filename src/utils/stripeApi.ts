
/**
 * Utility functions for interacting with Stripe API via Supabase Edge Functions
 */

/**
 * Fetches the current Stripe mode (test or live)
 * @returns A promise that resolves to an object containing the mode information
 */
export const fetchStripeMode = async () => {
  try {
    // Instead of using the edge function, fetch from the app_config table
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'STRIPE_MODE')
      .single();
    
    if (error) {
      console.error("Error fetching Stripe mode:", error);
      return { 
        mode: "test", // Default to test mode for safety
        error: error.message
      };
    }
    
    // Determine the mode from the value
    const mode = data?.value === 'live' ? 'live' : 'test';
    
    return { 
      mode: mode,
      error: null
    };
  } catch (error) {
    console.error("Error fetching Stripe mode:", error);
    return { 
      mode: "test", // Default to test mode for safety
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
