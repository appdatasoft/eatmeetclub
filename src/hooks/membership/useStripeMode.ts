
// src/hooks/membership/useStripeMode.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useStripeMode = () => {
  const [mode, setMode] = useState<"test" | "live">("test");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stripeCheckError, setStripeCheckError] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  
  const checkStripeMode = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setStripeCheckError(false);
      
      // Check cache first (cache for 5 minutes)
      const now = Date.now();
      const cachedMode = localStorage.getItem('stripe_mode');
      const cachedTimestamp = localStorage.getItem('stripe_mode_timestamp');
      
      if (!forceRefresh && cachedMode && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        if (now - timestamp < 5 * 60 * 1000) { // 5 minutes
          console.log("Using cached Stripe mode:", cachedMode);
          setMode(cachedMode as "test" | "live");
          setIsLive(cachedMode === "live");
          setLastChecked(timestamp);
          setLoading(false);
          return;
        }
      }
      
      // Add a timestamp to prevent caching issues
      console.log("Checking Stripe mode from API...");
      const { data, error } = await supabase.functions.invoke(
        "check-stripe-mode",
        {
          body: { timestamp: now }
        }
      );
      
      if (error) {
        console.error("Error checking Stripe mode:", error);
        setStripeCheckError(true);
        return;
      }
      
      const stripeMode = data?.mode || "test";
      console.log("Stripe mode from API:", stripeMode);
      
      // Cache the result
      localStorage.setItem('stripe_mode', stripeMode);
      localStorage.setItem('stripe_mode_timestamp', now.toString());
      
      setMode(stripeMode);
      setIsLive(stripeMode === "live");
      setLastChecked(now);
    } catch (error) {
      console.error("Failed to check Stripe mode:", error);
      setStripeCheckError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleRetryStripeCheck = () => {
    checkStripeMode(true); // Force refresh
  };
  
  useEffect(() => {
    checkStripeMode();
  }, [checkStripeMode]);
  
  // For compatibility with existing code
  const isStripeTestMode = mode === "test";
  
  return { 
    mode, 
    isLive, 
    loading,
    isStripeTestMode, 
    stripeCheckError, 
    handleRetryStripeCheck,
    lastChecked
  };
};

export default useStripeMode;
