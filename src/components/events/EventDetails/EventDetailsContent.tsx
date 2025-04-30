
import React from "react";
import { Link } from "react-router-dom";
import EventDetailsContainer from "./EventDetailsContainer";
import TicketPurchase from "./TicketPurchase";
import EventActionButtons from "./EventActionButtons";
import UnpublishedEventNotice from "./UnpublishedEventNotice";
import { useIsMobile } from "@/hooks/use-mobile";
import { EventDetails } from "@/hooks/useEventDetails";
import RestaurantInfo from "./RestaurantInfo";

interface EventDetailsContentProps {
  event: EventDetails;
  ticketsRemaining: number;
  ticketsPercentage: number;
  eventUrl: string;
  isCurrentUserOwner: boolean;
  canEditEvent: boolean;
  handleTicketPurchase: (ticketCount: number) => void;
  handleEditEvent: () => void;
  handleDeleteEvent: () => void;
  isPaymentProcessing: boolean;
  user: any | null;
}

const EventDetailsContent: React.FC<EventDetailsContentProps> = ({
  event,
  ticketsRemaining,
  ticketsPercentage,
  eventUrl,
  isCurrentUserOwner,
  canEditEvent,
  handleTicketPurchase,
  handleEditEvent,
  handleDeleteEvent,
  isPaymentProcessing,
  user
}) => {
  const isMobile = useIsMobile();
  
  const locationStr = `${event.restaurant.address}, ${event.restaurant.city}, ${event.restaurant.state} ${event.restaurant.zipcode}`;

  return (
    <div className="container-custom py-4 md:py-8">
      {canEditEvent && (
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} mb-4 ${isMobile ? 'space-y-2' : 'space-x-2'}`}>
          <EventActionButtons
            eventUrl={eventUrl}
            eventTitle={event.title}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            isPublished={event.published}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Main content */}
        <EventDetailsContainer
          event={event}
          ticketsRemaining={ticketsRemaining}
          ticketsPercentage={ticketsPercentage}
          location={locationStr}
          eventUrl={eventUrl}
          isCurrentUserOwner={isCurrentUserOwner}
        />

        {/* Ticket purchase sidebar */}
        <div className="lg:col-span-1">
          {event.published && (
            <TicketPurchase 
              price={event.price}
              ticketsRemaining={ticketsRemaining}
              onBuyTickets={handleTicketPurchase}
              isPaymentProcessing={isPaymentProcessing}
              isLoggedIn={!!user}
            />
          )}
          
          {!event.published && canEditEvent && (
            <UnpublishedEventNotice />
          )}

          {/* Restaurant info */}
          <div className="mt-4 bg-accent p-4 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Hosted at</h3>
            <Link 
              to={`/restaurant/${event.restaurant.id}`} 
              className="text-primary hover:underline font-medium block"
            >
              {event.restaurant.name}
            </Link>
            <p className="text-sm mt-1">{locationStr}</p>
          </div>

          {/* Event creator link */}
          {event.user_id && (
            <div className="mt-4 bg-accent p-4 rounded-lg shadow-sm">
              <h3 className="font-medium mb-2">Event Creator</h3>
              <Link 
                to={`/user/${event.user_id}`} 
                className="text-primary hover:underline font-medium"
              >
                View Creator Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsContent;
