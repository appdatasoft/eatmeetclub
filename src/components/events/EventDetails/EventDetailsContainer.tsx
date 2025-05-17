
import React from "react";
import EventInfo from "./EventInfo";
import RestaurantInfo from "./RestaurantInfo";
import QRCode from "./QRCode";
import { EventDetails } from "@/types/event";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  // Log restaurant data for debugging
  console.log("Restaurant data in EventDetailsContainer:", event.restaurant);
  
  return (
    <div className="lg:col-span-2">
      <EventInfo 
        description={event.description}
        date={event.date}
        time={event.time}
        location={location}
        capacity={event.capacity}
        ticketsRemaining={ticketsRemaining}
        ticketsPercentage={ticketsPercentage}
      />
      <RestaurantInfo 
        id={event.restaurant?.id}
        name={event.restaurant?.name || "Unknown Restaurant"} 
        description={event.restaurant?.description}
      />
      {!isCurrentUserOwner && !isMobile && (
        <div className="mt-6 flex justify-end">
          <QRCode url={eventUrl} eventTitle={event.title} />
        </div>
      )}
      {!isCurrentUserOwner && isMobile && (
        <div className="mt-6 flex justify-center">
          <QRCode url={eventUrl} eventTitle={event.title} />
        </div>
      )}
    </div>
  );
};

export default EventDetailsContainer;
