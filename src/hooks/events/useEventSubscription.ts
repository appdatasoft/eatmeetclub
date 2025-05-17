
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";

export const useEventSubscription = () => {
  const lastRefreshRef = useRef(0);
  const timeoutIdRef = useRef<number | null>(null);
  const throttleDelay = 3000; // 3-second throttle
  
  const subscribeToEventChanges = (onChangeCallback: () => void) => {
    // Clear any existing timeout when creating a new subscription
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    const throttledCallback = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current > throttleDelay) {
        lastRefreshRef.current = now;
        onChangeCallback();
      } else {
        console.log("Skipped refresh: throttled");
        // Schedule a refresh after the throttle period
        if (timeoutIdRef.current === null) {
          timeoutIdRef.current = window.setTimeout(() => {
            lastRefreshRef.current = Date.now();
            onChangeCallback();
            timeoutIdRef.current = null;
          }, throttleDelay);
        }
      }
    };

    const channel = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "events",
        },
        (payload) => {
          console.log("Event change detected:", payload.eventType, payload);
          throttledCallback();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  };

  return { subscribeToEventChanges };
};
