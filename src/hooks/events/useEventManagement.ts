
import { useToast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "@/hooks/types/eventTypes";

export const useEventManagement = (
  event: EventDetails | null,
  refreshEventDetails: () => Promise<void>,
  canEditEvent: boolean,
  navigate: NavigateFunction,
  isDeleting: boolean,
  setIsDeleting: (value: boolean) => void,
  setIsDeleteDialogOpen: (value: boolean) => void
) => {
  const { toast } = useToast();
  
  const handleEditEvent = () => {
    if (!event) return;
    
    // Check if the event is published
    if (event.published) {
      toast({
        title: "Cannot Edit",
        description: "Published events cannot be edited. Please unpublish the event first.",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/edit-event/${event.id}`);
  };
  
  const handleDeleteEvent = async () => {
    if (!event) return;
    
    // Check if user can delete this event
    if (!canEditEvent) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete this event",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
        
      if (error) throw error;
      
      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted",
      });
      
      // Navigate back to events list
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return {
    handleEditEvent,
    handleDeleteEvent
  };
};
