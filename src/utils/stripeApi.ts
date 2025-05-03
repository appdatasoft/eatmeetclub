
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
        mode: "test", // Default to test mode for safety
        error: `API returned status ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    // First try to parse as JSON
    let responseText;
    try {
      responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Check if response is HTML (likely an error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || 
          responseText.trim().startsWith('<html')) {
        console.error("Received HTML instead of JSON:", responseText.substring(0, 200));
        throw new Error("Invalid response format: received HTML instead of JSON");
      }
      
      const data = JSON.parse(responseText);
      console.log("Stripe mode data:", data);
      
      return { 
        mode: data.mode || "test", // Default to test mode if not specified
        error: null
      };
    } catch (parseError) {
      console.error("Error parsing response as JSON:", parseError);
      console.error("Raw response was:", responseText);
      return { 
        mode: "test", // Default to test mode on parse error
        error: `Failed to parse response: ${responseText?.substring(0, 100)}` 
      };
    }
  } catch (error) {
    console.error("Error fetching Stripe mode:", error);
    return { 
      mode: "test", // Default to test mode for safety
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};
