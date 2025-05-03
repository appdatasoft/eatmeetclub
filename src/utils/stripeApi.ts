
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

    // Print the raw response for debugging
    const rawResponse = await response.text();
    console.log("Raw response:", rawResponse);

    // Parse the text as JSON
    let data;
    try {
      data = JSON.parse(rawResponse);
      console.log("Stripe mode data:", data);
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError, "Raw response:", rawResponse.substring(0, 200));
      return { 
        mode: "test", // Default to test mode for safety
        error: "Invalid JSON response received"
      };
    }
    
    return { 
      mode: data.mode || "test", // Default to test mode if not specified
      error: data.error || null
    };
  } catch (error) {
    console.error("Error fetching Stripe mode:", error);
    return { 
      mode: "test", // Default to test mode for safety
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
