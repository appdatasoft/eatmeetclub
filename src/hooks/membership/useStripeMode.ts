
import { useState, useEffect, useCallback } from "react";
import { fetchStripeMode } from "@/utils/stripeApi";

export const useStripeMode = () => {
  const [isStripeTestMode, setIsStripeTestMode] = useState<boolean | null>(null);
  const [stripeCheckError, setStripeCheckError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  
  const checkStripeMode = useCallback(async () => {
    if (isRetrying) {
      setIsRetrying(false);
    }
    
    try {
      setStripeCheckError(false);
      const { isTestMode, error, publishableKey } = await fetchStripeMode();
      
      if (error) {
        console.warn("Non-critical error checking Stripe mode:", error);
        setStripeCheckError(true);
        // Default to assuming test mode on error
        setIsStripeTestMode(true);
      } else {
        setIsStripeTestMode(isTestMode);
        if (publishableKey) {
          setStripePublishableKey(publishableKey);
        }
      }
    } catch (error) {
      console.error("Error checking Stripe mode:", error);
      setStripeCheckError(true);
      // Default to assuming we're in test mode if we can't determine
      setIsStripeTestMode(true);
    }
  }, [isRetrying]);
  
  useEffect(() => {
    checkStripeMode();
  }, [checkStripeMode]);

  const handleRetryStripeCheck = () => {
    setIsRetrying(true);
  };

  return {
    isStripeTestMode,
    stripeCheckError,
    stripePublishableKey,
    handleRetryStripeCheck
  };
};

export default useStripeMode;
