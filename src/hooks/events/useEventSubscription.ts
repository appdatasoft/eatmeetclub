
import { supabase } from "@/integrations/supabase/client";
import { useRef } from "react";

export const useEventSubscription = () => {
  const lastRefreshRef = useRef(0);
  const timeoutIdRef = useRef<number | null>(null);
  const throttleDelay = 15000; // Increased to 15-second throttle to reduce network calls
  const subscribedRef = useRef(false);
  
  const subscribeToEventChanges = (onChangeCallback: () => void) => {
    // Don't create duplicate subscriptions
    if (subscribedRef.current) {
      console.log("Already subscribed to events, ignoring duplicate subscription");
      return () => {};
    }
    
    // Clear any existing timeout when creating a new subscription
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    subscribedRef.current = true;

    const throttledCallback = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current > throttleDelay) {
        lastRefreshRef.current = now;
        onChangeCallback();
        console.log("Refreshing events data due to database change");
      } else {
        console.log("Skipping refresh: throttled");
        // Schedule a refresh after the throttle period but only if not already scheduled
        if (timeoutIdRef.current === null) {
          timeoutIdRef.current = window.setTimeout(() => {
            lastRefreshRef.current = Date.now();
            onChangeCallback();
            console.log("Delayed refresh of events executed");
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
      subscribedRef.current = false;
      supabase.removeChannel(channel);
    };
  };

  return { subscribeToEventChanges };
};
