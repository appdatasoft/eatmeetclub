import { supabase } from "@/integrations/supabase/client";

export const useEventSubscription = () => {
  const subscribeToEventChanges = (onChangeCallback: () => void) => {
    let lastRefresh = 0;

    const throttledCallback = () => {
      const now = Date.now();
      if (now - lastRefresh > 3000) { // 3-second throttle
        lastRefresh = now;
        onChangeCallback();
      } else {
        console.log("Skipped refresh: throttled");
      }
    };

    const channel = supabase
      .channel("public:events")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Only respond to new event rows
          schema: "public",
          table: "events",
        },
        (payload) => {
          console.log("New event inserted:", payload);
          throttledCallback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return { subscribeToEventChanges };
};
