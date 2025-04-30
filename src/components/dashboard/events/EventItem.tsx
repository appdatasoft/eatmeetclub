
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link, CheckCircle, AlertCircle, Globe, Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Event, Ticket } from "./types";
import EventTickets from "./EventTickets";

interface EventItemProps {
  event: Event;
  onRefresh?: () => void;
}

const EventItem = ({ event, onRefresh }: EventItemProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [publishingEventId, setPublishingEventId] = useState<string | null>(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [eventTickets, setEventTickets] = useState<Ticket[]>([]);
  
  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

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
  
  const fetchTicketsForEvent = async (eventId: string) => {
    if (eventTickets.length > 0) {
      return; // Already fetched tickets for this event
    }
    
    try {
      setTicketsLoading(true);
      
      // Fetch tickets for the event
      const { data: ticketsData, error } = await supabase
        .from('tickets')
        .select('*, user:user_id(email)')
        .eq('event_id', eventId)
        .eq('payment_status', 'completed');
      
      if (error) throw error;
      
      // Format tickets data for display
      const formattedTickets = ticketsData.map((ticket: any) => ({
        ...ticket,
        user_email: ticket.user?.email,
        purchase_date: format(new Date(ticket.purchase_date), 'MMM d, yyyy h:mm a')
      }));
      
      setEventTickets(formattedTickets);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load ticket information",
        variant: "destructive"
      });
    } finally {
      setTicketsLoading(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <span 
          className="cursor-pointer text-primary hover:underline flex items-center"
          onClick={() => handleEventClick(event.id)}
        >
          {event.title}
          <Link className="ml-1 h-3 w-3" />
        </span>
        {event.published && (
          <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
            <Globe className="h-3 w-3 mr-1" /> Published
          </Badge>
        )}
      </TableCell>
      <TableCell>{event.restaurant?.name || 'Unknown'}</TableCell>
      <TableCell>{formatEventDate(event.date)}</TableCell>
      <TableCell>${event.price.toFixed(2)}</TableCell>
      <TableCell>
        {event.payment_status === 'completed' ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Paid
          </Badge>
        ) : (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100">
            <AlertCircle className="h-3 w-3 mr-1" /> Payment Required
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {event.published && (
          <Collapsible 
            className="w-full"
            onOpenChange={() => event.published && fetchTicketsForEvent(event.id)}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto flex items-center text-primary font-medium"
              >
                <span className="font-bold">{event.tickets_sold || 0}</span>
                <span className="text-xs ml-1">/{event.capacity}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="border rounded-md mt-2 p-2 bg-slate-50">
              <EventTickets 
                tickets={eventTickets}
                isLoading={ticketsLoading}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
        {!event.published && (
          <span className="text-gray-400 text-sm">Not published</span>
        )}
      </TableCell>
      <TableCell>
        {event.payment_status === 'completed' ? (
          <div className="flex items-center space-x-2">
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
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/edit-event/${event.id}`)}
            >
              Edit
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/dashboard/payment/${event.id}`)}
          >
            Complete Payment
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default EventItem;
