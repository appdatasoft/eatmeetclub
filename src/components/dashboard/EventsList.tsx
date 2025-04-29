
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Globe, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

const EventsList = ({ events, isLoading, onPublishEvent, onRefresh }: EventsListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [publishingEventId, setPublishingEventId] = useState<string | null>(null);
  
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <span 
                        className="cursor-pointer text-primary hover:underline"
                        onClick={() => handleEventClick(event.id)}
                      >
                        {event.title}
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
                      {event.payment_status === 'completed' ? (
                        <Button
                          size="sm"
                          variant={event.published ? "outline" : "default"}
                          onClick={() => handlePublishToggle(event)}
                          disabled={publishingEventId === event.id}
                          className={event.published ? "border-orange-200 text-orange-700 hover:bg-orange-50" : "bg-green-600 hover:bg-green-700"}
                        >
                          {publishingEventId === event.id ? (
                            <span className="flex items-center">
                              <div className="h-3 w-3 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                              {event.published ? "Unpublishing..." : "Publishing..."}
                            </span>
                          ) : (
                            <span className="flex items-center">
                              {event.published ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" /> 
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Globe className="h-4 w-4 mr-1" /> 
                                  Publish
                                </>
                              )}
                            </span>
                          )}
                        </Button>
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
