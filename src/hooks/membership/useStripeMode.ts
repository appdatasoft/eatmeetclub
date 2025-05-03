
import { useState, useEffect } from "react";
import { fetchStripeMode } from "@/utils/stripeApi";

export const useStripeMode = () => {
  const [isStripeTestMode, setIsStripeTestMode] = useState<boolean | null>(null);
  const [stripeCheckError, setStripeCheckError] = useState<boolean>(false);

  const checkStripeMode = async () => {
    try {
      const { isTestMode, error } = await fetchStripeMode();
      
      setIsStripeTestMode(isTestMode);
      setStripeCheckError(!!error);
      
      if (error) {
        console.warn("Stripe mode check error:", error);
      }
    } catch (error) {
      console.error("Error checking Stripe mode:", error);
      setIsStripeTestMode(true); // Default to test mode
      setStripeCheckError(true);
    }
  };

  useEffect(() => {
    checkStripeMode();
  }, []);

  const handleRetryStripeCheck = () => {
    setStripeCheckError(false);
    checkStripeMode();
  };

  return { isStripeTestMode, stripeCheckError, handleRetryStripeCheck };
};
