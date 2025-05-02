
/**
 * Utility functions for interacting with Stripe via Edge Functions
 */

export const fetchStripeMode = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/check-stripe-mode`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        cache: "no-store"
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to check Stripe mode: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      isTestMode: data.isTestMode,
      error: null
    };
  } catch (error) {
    console.error("Error checking Stripe mode:", error);
    return {
      isTestMode: true, // Default to test mode on error
      error: error instanceof Error ? error.message : "Unknown error checking Stripe mode"
    };
  }
};

export const createMembershipCheckout = async (
  email: string,
  name: string,
  phone?: string,
  address?: string,
  options?: {
    redirectToCheckout?: boolean;
    createUser?: boolean;
    sendPasswordEmail?: boolean;
    sendInvoiceEmail?: boolean;
  }
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          name,
          phone: phone || null,
          address: address || null,
          redirectToCheckout: options?.redirectToCheckout || false,
          createUser: options?.createUser || true,
          sendPasswordEmail: options?.sendPasswordEmail || true,
          sendInvoiceEmail: options?.sendInvoiceEmail || true,
          timestamp: new Date().getTime() // Prevent caching
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed with status: ${response.status}`);
    }
    
    return {
      data: await response.json(),
      error: null
    };
  } catch (error) {
    console.error("Error creating membership checkout:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error creating checkout"
    };
  }
};
