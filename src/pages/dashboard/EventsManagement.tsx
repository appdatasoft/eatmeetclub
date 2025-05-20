
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import EventsManagementHeader from "@/components/dashboard/events/EventsManagement/EventsManagementHeader";
import EventsManagementContent from "@/components/dashboard/events/EventsManagement/EventsManagementContent";
import { useEventsData } from "@/components/dashboard/events/EventsManagement/useEventsData";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const EventsManagement = () => {
  const { events, isLoading, error, fetchEvents } = useEventsData();
  const navigate = useNavigate();

  // Ensure we're on the correct route - this helps with redirection issues
  useEffect(() => {
    const currentPath = window.location.pathname;
    // Check if we're on the correct route
    if (currentPath === "/dashboard/events" && events.length > 0) {
      console.log("Correct path for events management:", currentPath);
    }
  }, [events]);

  // Add a listener for navigation to event details
  useEffect(() => {
    const handleEventClick = (eventId: string) => {
      if (eventId) {
        navigate(`/event/${eventId}`);
      }
    };

    // Clean up any potential event listeners if needed
    return () => {
      // Cleanup code if necessary
    };
  }, [navigate]);

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
