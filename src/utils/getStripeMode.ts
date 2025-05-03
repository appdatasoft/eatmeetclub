
/**
 * Utility function to get the current Stripe mode with fallbacks
 */
export const getStripeMode = (): "test" | "live" => {
  // First check localStorage cache
  const cachedMode = localStorage.getItem('stripe_mode');
  
  if (cachedMode === "live") {
    return "live";
  }
  
  // Check if we have an environment flag
  const envMode = import.meta.env.VITE_STRIPE_MODE;
  if (envMode === "live") {
    return "live";
  }
  
  // Default to test mode (safest)
  return "test";
};

/**
 * Safely determine if we're in Stripe test mode
 */
export const isStripeTestMode = (): boolean => {
  return getStripeMode() !== "live";
};
