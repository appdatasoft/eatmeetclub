
// src/hooks/membership/useStripeMode.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useStripeMode = () => {
  const [mode, setMode] = useState<"test" | "live">("test");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stripeCheckError, setStripeCheckError] = useState(false);
  
  const checkStripeMode = async () => {
    try {
      setLoading(true);
      setStripeCheckError(false);
      
      // Call the function to check Stripe mode
      const { data, error } = await supabase.functions.invoke("check-stripe-mode");
      
      if (error) {
        console.error("Error checking Stripe mode:", error);
        setStripeCheckError(true);
        return;
      }
      
      const stripeMode = data?.mode || "test";
      setMode(stripeMode);
      setIsLive(stripeMode === "live");
    } catch (error) {
      console.error("Failed to check Stripe mode:", error);
      setStripeCheckError(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRetryStripeCheck = () => {
    checkStripeMode();
  };
  
  useEffect(() => {
    checkStripeMode();
  }, []);
  
  // For compatibility with existing code
  const isStripeTestMode = mode === "test";
  
  return { 
    mode, 
    isLive, 
    loading,
    isStripeTestMode, 
    stripeCheckError, 
    handleRetryStripeCheck 
  };
};

export default useStripeMode;
