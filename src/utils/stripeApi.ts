
/**
 * Utility functions for interacting with Stripe API via Supabase Edge Functions
 */

/**
 * Fetches the current Stripe mode (test or live)
 * @returns A promise that resolves to an object containing the mode information
 */
export const fetchStripeMode = async () => {
  try {
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/check-stripe-mode?_=${timestamp}`;
    
    console.log("Fetching Stripe mode from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
      // Omit credentials to prevent CORS preflight issues
      credentials: 'omit'
    });

    console.log("Stripe mode response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Stripe key fetch failed with status: ${response.status}`, errorText);
      return { 
        isTestMode: true, // Default to test mode for safety
        error: `API returned status ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const data = await response.json();
    console.log("Stripe mode data:", data);
    
    return { 
      isTestMode: data.isTestMode ?? true, // Default to test mode if not specified
      publishableKey: data.key,
      error: null
    };
  } catch (error) {
    console.error("Error fetching Stripe mode:", error);
    return { 
      isTestMode: true, // Default to test mode for safety
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
