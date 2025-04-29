
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
}

interface UpcomingEventsProps {
  events: Event[];
  isLoading: boolean;
}

const UpcomingEvents = ({ events, isLoading }: UpcomingEventsProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Your scheduled events</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-2">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="p-2 border rounded-md">
                <div 
                  className="font-medium flex items-center text-primary cursor-pointer hover:underline"
                  onClick={() => handleEventClick(event.id)}
                >
                  {event.title}
                  <Link className="ml-1 h-3 w-3" />
                </div>
                <div className="text-sm text-gray-500">
                  {formatEventDate(event.date)} at {event.time}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            No upcoming events scheduled.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
