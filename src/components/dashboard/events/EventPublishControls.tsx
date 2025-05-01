
import { useState } from "react";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Event } from "./types";

interface EventPublishControlsProps {
  event: Event;
  onRefresh?: () => void;
}

const EventPublishControls = ({ event, onRefresh }: EventPublishControlsProps) => {
  const { toast } = useToast();
  const [publishingEventId, setPublishingEventId] = useState<string | null>(null);
  
  const handlePublishToggle = async (event: Event) => {
    if (event.payment_status !== 'completed' && !event.published) {
      toast({
        title: "Payment Required",
        description: "You need to complete the payment before publishing this event",
        variant: "destructive"
      });
      return;
    }

    try {
      setPublishingEventId(event.id);
      
      // Toggle the published state
      const newPublishedState = !event.published;
      
      const { error } = await supabase
        .from('events')
        .update({ published: newPublishedState })
        .eq('id', event.id);
        
      if (error) throw error;
      
      toast({
        title: newPublishedState ? "Event Published" : "Event Unpublished",
        description: newPublishedState 
          ? "Your event is now visible to the public" 
          : "Your event has been hidden from the public"
      });
      
      // Refresh the events list
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error: any) {
      console.error("Error toggling event publish state:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event status",
        variant: "destructive"
      });
    } finally {
      setPublishingEventId(null);
    }
  };

  return (
    <Button
      size="icon"
      variant={event.published ? "outline" : "default"}
      onClick={() => handlePublishToggle(event)}
      disabled={publishingEventId === event.id}
      className={event.published ? "border-orange-200 text-orange-700 hover:bg-orange-50 h-8 w-8" : "bg-green-600 hover:bg-green-700 h-8 w-8"}
      title={event.published ? "Unpublish Event" : "Publish Event"}
    >
      {publishingEventId === event.id ? (
        <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
      ) : event.published ? (
        <X className="h-4 w-4" />
      ) : (
        <Check className="h-4 w-4" />
      )}
    </Button>
  );
};

export default EventPublishControls;
