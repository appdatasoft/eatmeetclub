
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useEventSubscription = () => {
  const subscribeToEventChanges = useCallback((onEventChange: () => void) => {
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
          }
        });

      // Return unsubscribe function
      return () => {
        console.log("Cleaning up event change subscription");
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Failed to create subscription:", error);
      // Return a no-op cleanup function
      return () => {};
    }
  }, []);

  return { subscribeToEventChanges };
};
