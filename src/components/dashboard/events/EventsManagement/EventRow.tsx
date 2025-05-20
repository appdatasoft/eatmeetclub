import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit, Eye, Trash2, AlertTriangle, Loader2, Copy, Link } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Event } from "./types";
import SupabaseImage from "@/components/common/SupabaseImage";

interface EventRowProps {
  event: Event;
  onRefresh: () => void;
}

const EventRow = ({ event, onRefresh }: EventRowProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

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

  const getEventUrl = (event: Event): string => {
    // Create a URL-friendly slug from event title
    const titleSlug = event.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    return `${window.location.origin}/event/${titleSlug}-${event.id}`;
  };

  const handleCopyLink = (event: Event) => {
    const eventUrl = getEventUrl(event);
    navigator.clipboard.writeText(eventUrl).then(
      () => {
        setCopiedLinkId(event.id);
        toast({
          title: "Link copied!",
          description: "Event link copied to clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedLinkId(null);
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <TableRow key={event.id}>
      <TableCell>
        <div className="h-12 w-16 overflow-hidden rounded-md">
          <SupabaseImage
            src={event.cover_image || ''}
            alt={event.title || 'Event'}
            className="h-full w-full object-cover"
            fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='8' text-anchor='middle' dominant-baseline='middle' fill='%23888'%3E🖼️%3C/text%3E%3C/svg%3E"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{event.title}</TableCell>
      <TableCell>{event.restaurant?.name || "Unknown"}</TableCell>
      <TableCell>{formatDate(event.date)}</TableCell>
      <TableCell>${event.price}</TableCell>
      <TableCell>
        {event.payment_status !== 'completed' ? (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Payment Required
          </Badge>
        ) : (
          <div className="flex items-center space-x-2">
            <Switch
              checked={event.published}
              onCheckedChange={() => handleTogglePublish(event)}
              disabled={processingEventId === event.id}
              className={event.published 
                ? "data-[state=checked]:bg-green-600" 
                : "data-[state=unchecked]:bg-gray-300"
              }
            />
            <span className="text-xs font-medium">
              {event.published ? "Published" : "Draft"}
            </span>
            {processingEventId === event.id && (
              <Loader2 className="h-3 w-3 animate-spin ml-1" />
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        <span className="font-medium">
          {event.tickets_sold || 0}/{event.capacity}
        </span>
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleCopyLink(event)}
        >
          {copiedLinkId === event.id ? (
            <Check className="h-4 w-4 mr-1" />
          ) : (
            <Link className="h-4 w-4 mr-1" />
          )}
          {copiedLinkId === event.id ? "Copied" : "Copy"}
        </Button>
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
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EventRow;
