
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Eye, Edit, Trash2, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  date: string;
  restaurant: {
    name: string;
  };
  price: number;
  capacity: number;
  tickets_sold: number;
  published: boolean;
  payment_status: string;
}

const EventsManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("events")
        .select(`
          id, 
          title, 
          date, 
          price, 
          capacity,
          tickets_sold,
          published,
          payment_status,
          restaurant:restaurants(name)
        `)
        .order('date', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      setError(error.message || "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
      fetchEvents();
      
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
      fetchEvents();
      
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Events Management</CardTitle>
            <CardDescription>Manage your events</CardDescription>
          </div>
          <Button onClick={() => navigate("/dashboard/create-event")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-center">
              <p className="text-red-800">{error}</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={fetchEvents}
              >
                Try Again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't created any events yet</p>
              <Button onClick={() => navigate("/dashboard/create-event")}>
                Create Your First Event
              </Button>
            </div>
          ) : (
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
                          <Button
                            size="sm"
                            variant={event.published ? "outline" : "default"}
                            className={event.published ? "border-orange-200 text-orange-700 hover:bg-orange-50" : ""}
                            onClick={() => handleTogglePublish(event)}
                            disabled={processingEventId === event.id}
                          >
                            {processingEventId === event.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : event.published ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default EventsManagement;
