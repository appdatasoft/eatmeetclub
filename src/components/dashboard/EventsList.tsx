
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { EventsListProps } from "./events/types";
import EventsTable from "./events/EventsTable";
import LoadingEvents from "./events/LoadingEvents";
import EmptyEvents from "./events/EmptyEvents";

const EventsList = ({ 
  events, 
  isLoading, 
  error, 
  onRefresh 
}: EventsListProps) => {
  
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>All events you've created</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingEvents />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>All events you've created</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-red-600 mb-2">Error</h3>
            <p className="text-gray-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Your Events</CardTitle>
        <CardDescription>All events you've created</CardDescription>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <EventsTable events={events} onRefresh={onRefresh} />
        ) : (
          <EmptyEvents />
        )}
      </CardContent>
    </Card>
  );
};

export default EventsList;
