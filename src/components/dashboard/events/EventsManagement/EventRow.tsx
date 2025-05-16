
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit, Eye, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
import { Event } from "./types";

interface EventRowProps {
  event: Event;
  onRefresh: () => void;
}

const EventRow = ({ event, onRefresh }: EventRowProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const handleViewEvent = (id: string) => {
    navigate(`/event/${id}`);
  };

  const handleEditEvent = (id: string) => {
    navigate(`/edit-event/${id}`);
  };

  const handleTogglePublish = async (event: Event) => {
    // Prevent publishing if payment not completed
    if (event.payment_status !== 'completed' && !event.published) {
      toast({
        title: "Payment Required",
        description: "You need to complete payment before publishing this event",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessingEventId(event.id);
      
      const newStatus = !event.published;
      
      const { error } = await supabase
        .from('events')
        .update({ published: newStatus })
        .eq('id', event.id);
        
      if (error) throw error;
      
      toast({
        title: newStatus ? "Event Published" : "Event Unpublished",
        description: newStatus 
          ? "Your event is now visible to the public" 
          : "Your event has been hidden from the public"
      });
      
      // Refresh events list
      onRefresh();
      
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event status",
        variant: "destructive"
      });
    } finally {
      setProcessingEventId(null);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    
    try {
      setProcessingEventId(id);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Event Deleted",
        description: "The event has been permanently deleted"
      });
      
      // Refresh events list
      onRefresh();
      
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive"
      });
    } finally {
      setProcessingEventId(null);
    }
  };

  return (
    <TableRow key={event.id}>
      <TableCell className="font-medium">{event.title}</TableCell>
      <TableCell>{event.restaurant?.name || "Unknown"}</TableCell>
      <TableCell>{formatDate(event.date)}</TableCell>
      <TableCell>${event.price}</TableCell>
      <TableCell>
        {event.published ? (
          <Badge className="bg-green-100 text-green-800">Published</Badge>
        ) : event.payment_status !== 'completed' ? (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Payment Required
          </Badge>
        ) : (
          <Badge variant="outline">Draft</Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="font-medium">
          {event.tickets_sold || 0}/{event.capacity}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewEvent(event.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditEvent(event.id)}
            disabled={event.published}
            title={event.published ? "Published events cannot be edited" : "Edit event"}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteEvent(event.id)}
            disabled={processingEventId === event.id}
          >
            {processingEventId === event.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-500" />
            )}
          </Button>
          
          <div className="flex items-center" title={event.published ? "Unpublish Event" : "Publish Event"}>
            <Switch
              checked={event.published}
              onCheckedChange={() => handleTogglePublish(event)}
              disabled={processingEventId === event.id || (event.payment_status !== 'completed' && !event.published)}
              className={event.published ? "bg-green-600 data-[state=checked]:bg-green-600" : ""}
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EventRow;
