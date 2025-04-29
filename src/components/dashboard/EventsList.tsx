import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Globe, EyeOff, Check, X, Link, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Ticket {
  id: string;
  user_id: string;
  quantity: number;
  purchase_date: string;
  payment_status: string;
  total_amount: number;
  user_email?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  restaurant_id: string;
  capacity: number;
  price: number;
  payment_status: string;
  published: boolean;
  tickets_sold?: number;
  restaurant: {
    name: string;
  };
}

interface EventsListProps {
  events: Event[];
  isLoading: boolean;
  onPublishEvent?: (eventId: string, paymentStatus: string) => void;
  onRefresh?: () => void;
  isAdmin?: boolean;
}

const EventsList = ({ events, isLoading, onPublishEvent, onRefresh, isAdmin = false }: EventsListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [publishingEventId, setPublishingEventId] = useState<string | null>(null);
  const [ticketsLoading, setTicketsLoading] = useState<Record<string, boolean>>({});
  const [eventTickets, setEventTickets] = useState<Record<string, Ticket[]>>({});
  
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
    if (eventTickets[eventId]?.length > 0) {
      return; // Already fetched tickets for this event
    }
    
    try {
      setTicketsLoading((prev) => ({ ...prev, [eventId]: true }));
      
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
      
      setEventTickets((prev) => ({
        ...prev,
        [eventId]: formattedTickets
      }));
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load ticket information",
        variant: "destructive"
      });
    } finally {
      setTicketsLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };
  
  console.log("Events in EventsList:", events); // Debug: Log events to console
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Your Events</CardTitle>
        <CardDescription>All events you've created</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : events && events.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
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
                            {ticketsLoading[event.id] ? (
                              <div className="py-3 text-center">
                                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                <span className="ml-2 text-sm text-gray-500">Loading tickets...</span>
                              </div>
                            ) : eventTickets[event.id]?.length ? (
                              <div className="text-sm">
                                <div className="font-medium mb-1">Ticket Purchasers:</div>
                                <ul className="space-y-1">
                                  {eventTickets[event.id].map((ticket) => (
                                    <li key={ticket.id} className="flex justify-between">
                                      <span className="text-gray-700">{ticket.user_email || 'Anonymous'}</span>
                                      <span className="text-gray-500">
                                        {ticket.quantity} {ticket.quantity > 1 ? 'tickets' : 'ticket'} • {ticket.purchase_date}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="py-2 text-sm text-gray-500 text-center">
                                No tickets sold yet
                              </div>
                            )}
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
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
            <Button onClick={() => navigate('/dashboard/create-event')}>
              Create Your First Event
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsList;
