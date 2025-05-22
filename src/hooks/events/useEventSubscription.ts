
import { supabase } from "@/integrations/supabase/client";
import { useRef, useEffect } from "react";

export const useEventSubscription = () => {
  const lastRefreshRef = useRef(0);
  const timeoutIdRef = useRef<number | null>(null);
  const throttleDelay = 15000; // 15-second throttle to reduce network calls
  const subscribedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Add a utility function to handle connection issues
  const setupReconnectionHandler = (channel: any) => {
    channel.on('disconnect', (event: any) => {
      const reason = event?.reason || 'unknown';
      console.warn(`Supabase realtime disconnected: ${reason}`);
      
      // Only attempt reconnection if under max attempts
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        console.log(`Will attempt reconnection in ${backoffTime}ms (attempt ${reconnectAttemptsRef.current + 1})`);
        
        setTimeout(() => {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect to events (attempt ${reconnectAttemptsRef.current})`);
          channel.subscribe();
        }, backoffTime);
      } else {
        console.error('Maximum reconnection attempts reached. Please refresh the application.');
      }
    });
    
    return channel;
  };
  
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
    reconnectAttemptsRef.current = 0;

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
      .channel("events-channel", {
        config: {
          broadcast: { self: true }
        }
      })
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
        
        // Reset reconnect counter when successfully connected
        if (status === 'SUBSCRIBED') {
          reconnectAttemptsRef.current = 0;
          console.log('Successfully subscribed to events channel');
        }
      });
    
    // Setup reconnection handler
    setupReconnectionHandler(channel);

    // Clean up function that will be called when the component unmounts
    return () => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      subscribedRef.current = false;
      supabase.removeChannel(channel);
    };
  };
  
  // Add a useEffect to handle lifecycle and initialize at the right time
  useEffect(() => {
    return () => {
      // Clean up any pending timeouts on unmount
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);

  return { subscribeToEventChanges };
};
