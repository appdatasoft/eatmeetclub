
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
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add cache control headers
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
      // Credentials: omit to avoid CORS preflight issues
      credentials: 'omit'
    });

    if (!response.ok) {
      console.warn(`Stripe mode check failed with status: ${response.status}`);
      return { 
        isTestMode: true, // Default to test mode for safety
        error: `API returned status ${response.status}`
      };
    }

    const data = await response.json();
    return { 
      isTestMode: data.isTestMode,
      error: null
    };
  } catch (error) {
    console.error("Error checking Stripe mode:", error);
    return { 
      isTestMode: true, // Default to test mode for safety
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
