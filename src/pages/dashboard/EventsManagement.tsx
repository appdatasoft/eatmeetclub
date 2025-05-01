
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import EventsManagementHeader from "@/components/dashboard/events/EventsManagement/EventsManagementHeader";
import EventsManagementContent from "@/components/dashboard/events/EventsManagement/EventsManagementContent";
import { useEventsData } from "@/components/dashboard/events/EventsManagement/useEventsData";

const EventsManagement = () => {
  const { events, isLoading, error, fetchEvents } = useEventsData();

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <EventsManagementHeader />
        </CardHeader>
        <CardContent>
          <EventsManagementContent 
            events={events}
            isLoading={isLoading}
            error={error}
            onRetry={fetchEvents}
            onRefresh={fetchEvents}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default EventsManagement;
