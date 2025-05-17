
import { supabase } from "@/integrations/supabase/client";

export const useEventSubscription = () => {
  const subscribeToEventChanges = (onChangeCallback: () => void) => {
    const channel = supabase
      .channel('public:events')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'events'
      }, (payload) => {
        console.log('Events table changed:', payload);
        onChangeCallback();
      })
      .subscribe();
      
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  };

  return { subscribeToEventChanges };
};
