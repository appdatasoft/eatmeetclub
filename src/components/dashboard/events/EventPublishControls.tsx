
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Event } from "./types";
import { Loader2 } from "lucide-react";
import { useMembershipStatus } from "@/hooks/useMembershipStatus";

interface EventPublishControlsProps {
  event: Event;
  onRefresh?: () => void;
}

const EventPublishControls = ({ event, onRefresh }: EventPublishControlsProps) => {
  const { toast } = useToast();
  const [publishingEventId, setPublishingEventId] = useState<string | null>(null);
  const { restaurantMemberships } = useMembershipStatus();
  
  // Check if user has an active membership for this restaurant
  const hasRestaurantMembership = restaurantMemberships.some(
    m => m.restaurant_id === event.restaurant_id
  );
  
  const handlePublishToggle = async (event: Event) => {
    // Check for payment requirement
    if (event.payment_status !== 'completed' && !event.published) {
      toast({
        title: "Payment Required",
        description: "You need to complete the payment before publishing this event",
        variant: "destructive"
      });
      return;
    }
    
    // Check for restaurant membership requirement when publishing
    if (!event.published && !hasRestaurantMembership) {
      toast({
        title: "Membership Required",
        description: "You need an active membership for this restaurant to publish events",
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
    <div className="relative">
      {publishingEventId === event.id && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 z-10">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      
      <Switch
        checked={event.published}
        onCheckedChange={() => handlePublishToggle(event)}
        disabled={
          publishingEventId === event.id || 
          (event.payment_status !== 'completed' && !event.published) ||
          (!event.published && !hasRestaurantMembership)
        }
        className={event.published ? "data-[state=checked]:bg-green-600" : ""}
        title={
          !hasRestaurantMembership && !event.published 
            ? "Requires restaurant membership" 
            : event.published 
              ? "Unpublish Event" 
              : "Publish Event"
        }
      />
    </div>
  );
};

export default EventPublishControls;
