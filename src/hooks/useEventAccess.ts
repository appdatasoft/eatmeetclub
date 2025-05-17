
import { useState, useEffect } from "react";
import { EventDetails } from "@/types/event";
import { useAuth } from "@/hooks/useAuth";

export const useEventAccess = (event: EventDetails | null) => {
  const { user, isAdmin } = useAuth();
  const [canEditEvent, setCanEditEvent] = useState(false);

  // Check if user can edit this event
  useEffect(() => {
    if (event && user) {
      // Check if user is owner or admin
      const isOwner = event.user_id === user.id;
      setCanEditEvent(isOwner || isAdmin);
    } else {
      setCanEditEvent(false);
    }
  }, [event, user, isAdmin]);

  return { canEditEvent };
};

export default useEventAccess;
