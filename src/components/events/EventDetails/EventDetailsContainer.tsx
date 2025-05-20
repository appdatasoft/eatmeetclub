import React from "react";
import EventInfo from "./EventInfo";
import RestaurantInfo from "./RestaurantInfo";
import QRCode from "./QRCode";
import { EventDetails } from "@/types/event";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface EventDetailsContainerProps {
  event: EventDetails;
  ticketsRemaining: number;
  ticketsPercentage: number;
  location: string;
  eventUrl: string;
  isCurrentUserOwner: boolean;
}

const EventDetailsContainer: React.FC<EventDetailsContainerProps> = ({
  event,
  ticketsRemaining,
  ticketsPercentage,
  location,
  eventUrl,
  isCurrentUserOwner
}) => {
  const isMobile = useIsMobile();

  const restaurant = event.restaurant || {
    id: "unknown",
    name: "Unknown Restaurant",
    address: '',
    city: '',
    state: '',
    zipcode: '',
    description: ''
  };

  const hasIncompleteRestaurantData = !restaurant.id || restaurant.id === "unknown";

  if (process.env.NODE_ENV !== 'production') {
    console.log("Restaurant data in EventDetailsContainer:", restaurant);
  }

  return (
    <div className="lg:col-span-2">
      <EventInfo 
        description={event.description || ''}
        date={event.date || ''}
        time={event.time || ''}
        location={location}
        capacity={event.capacity || 0}
        ticketsRemaining={ticketsRemaining}
        ticketsPercentage={ticketsPercentage}
      />

      {hasIncompleteRestaurantData && isCurrentUserOwner && (
        <Alert variant="destructive" className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Restaurant information appears to be incomplete. Please update the restaurant details.
          </AlertDescription>
        </Alert>
      )}

      <RestaurantInfo 
        restaurant={restaurant}
        isCurrentUserOwner={isCurrentUserOwner}
      />

      {!isCurrentUserOwner && (
        <div className="mt-6 flex justify-center lg:justify-end">
          <QRCode url={eventUrl} eventTitle={event.title || 'Event'} />
        </div>
      )}
    </div>
  );
};

export default EventDetailsContainer;

