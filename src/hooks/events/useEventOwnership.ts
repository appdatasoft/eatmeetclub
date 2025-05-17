
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useEventOwnership = () => {
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);

  const checkOwnership = async (eventUserId: string) => {
    // Get the current user (if logged in)
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    
    if (currentUserId && eventUserId === currentUserId) {
      return true;
    }
    
    return false;
  };

  return {
    checkOwnership,
    isCurrentUserOwner,
    setIsCurrentUserOwner
  };
};
