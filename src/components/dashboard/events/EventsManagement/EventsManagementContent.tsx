
import { Event } from "./types";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import EventsTable from "./EventsTable";

interface EventsManagementContentProps {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRefresh: () => void;
}

const EventsManagementContent = ({
  events,
  isLoading,
  error,
  onRetry,
  onRefresh
}: EventsManagementContentProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (events.length === 0) {
    return <EmptyState />;
  }

  return <EventsTable events={events} onRefresh={onRefresh} />;
};

export default EventsManagementContent;
