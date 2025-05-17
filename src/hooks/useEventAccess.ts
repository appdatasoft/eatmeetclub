
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EventDetails } from "@/types/event";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useEventAccess = (event: EventDetails | null) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Check if this event is published, if not, only owners and admins can view
  useEffect(() => {
    const checkAccess = async () => {
      if (!event) return;
      if (!user) return; // Public users can only see published events
      
      try {
        // For unpublished events, check if user is owner or admin
        if (!event.published) {
          const isOwner = event.user_id === user.id;
          if (!isOwner && !isAdmin) {
            toast({
              title: "Access Denied",
              description: "This event is not currently published.",
              variant: "destructive"
            });
            navigate('/events');
          }
        }
      } catch (error) {
        console.error("Error checking event access:", error);
      }
    };
    
    checkAccess();
  }, [event, user, navigate, toast, isAdmin]);

  return { canEditEvent };
};

export default useEventAccess;
