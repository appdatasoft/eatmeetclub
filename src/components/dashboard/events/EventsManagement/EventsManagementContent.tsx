
import { useToast } from "@/hooks/use-toast";
import { Event } from "./types";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
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

  if (!events || events.length === 0) {
    return <EmptyState />;
  }

  return (
    <EventsTable events={events} onRefresh={onRefresh} />
  );
};

export default EventsManagementContent;
