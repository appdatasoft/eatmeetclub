
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useEventSubscription = () => {
  const subscribeToEventChanges = useCallback((onEventChange: (error?: Error) => void) => {
    try {
      console.log("Setting up event change subscription");
      
      // Create the subscription with better error handling
      const subscription = supabase
        .channel('public:events')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: 'published=eq.true'
        }, () => {
          console.log("Event change detected");
          onEventChange();
        })
        .subscribe((status) => {
          console.log("Subscription status:", status);
          
          // Handle subscription errors gracefully
          if (status === 'CHANNEL_ERROR') {
            console.warn("Real-time subscription error. Events won't update automatically.");
            onEventChange(new Error("Subscription channel error"));
          } else if (status === 'SUBSCRIBED') {
            // Successfully subscribed
            console.log("Successfully subscribed to event changes");
            onEventChange(); // Trigger refresh when subscription is established
          }
        });

      // Return unsubscribe function
      return () => {
        console.log("Cleaning up event change subscription");
        subscription.unsubscribe();
      };
    } catch (error: any) {
      console.error("Failed to create subscription:", error);
      
      // Notify caller about the subscription error
      setTimeout(() => {
        onEventChange(error);
      }, 0);
      
      // Return a no-op cleanup function
      return () => {};
    }
  }, []);

  return { subscribeToEventChanges };
};
