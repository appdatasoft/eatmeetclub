
import React from "react";
import EventCard, { EventCardProps } from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";

interface EventsListProps {
  events: EventCardProps[];
  isLoading: boolean;
  error: string | null;
}

const EventsList = React.memo(({ events, isLoading, error }: EventsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-6 w-5/6 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-red-600 mb-2">Error</h3>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No events found</h3>
        <p className="text-gray-500">
          Try adjusting your filters or check back later for upcoming events.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparator for more precise control over re-renders
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.error !== nextProps.error) return false;
  if (prevProps.events.length !== nextProps.events.length) return false;
  
  // Only do deep comparison if everything else is the same
  return prevProps.events.every((event, index) => 
    event.id === nextProps.events[index]?.id
  );
});

export default EventsList;
