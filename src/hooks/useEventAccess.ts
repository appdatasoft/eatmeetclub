
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EventDetails } from "@/hooks/useEventDetails";

export const useEventAccess = (event: EventDetails | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [canEditEvent, setCanEditEvent] = useState(false);
  
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
      
      // Debug log
      console.log("Checking event access:", { 
        published: event.published, 
        canEditEvent, 
        userId: user?.id,
        eventUserId: event.user_id
      });
      
      // If event exists but is not published and user is not owner/admin
      if (event && !event.published && !canEditEvent) {
        toast({
          title: "Access Denied",
          description: "This event is not currently published.",
          variant: "destructive"
        });
        navigate('/events');
      }
    };
    
    checkAccess();
  }, [event, canEditEvent, navigate, toast, user]);

  return { canEditEvent };
};
