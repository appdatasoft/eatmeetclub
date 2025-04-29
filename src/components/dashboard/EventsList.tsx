
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  restaurant_id: string;
  capacity: number;
  price: number;
  payment_status: string;
  restaurant: {
    name: string;
  };
}

interface EventsListProps {
  events: Event[];
  isLoading: boolean;
  onPublishEvent: (eventId: string, paymentStatus: string) => void;
}

const EventsList = ({ events, isLoading, onPublishEvent }: EventsListProps) => {
  const navigate = useNavigate();
  
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
                          onClick={() => onPublishEvent(event.id, event.payment_status)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Publish Event
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
