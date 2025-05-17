
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import EventDetailsContainer from "./EventDetailsContainer";
import { TicketPurchase } from "@/components/events/TicketPurchase";
import EventActionButtons from "./EventActionButtons";
import { EventDetails } from "@/types/event";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const navigate = useNavigate();
  
  console.log("EventDetailsContent received event:", event);
  
  // Ensure restaurant info is available
  const restaurant = event.restaurant || { 
    id: "unknown", 
    name: "Unknown Restaurant", 
    address: '', 
    city: '', 
    state: '', 
    zipcode: '',
    description: ''
  };
  const locationStr = `${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipcode}`;

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
              eventId={event.id}
              ticketPrice={event.price}
              ticketsRemaining={ticketsRemaining} 
              isProcessing={isPaymentProcessing}
              onPurchase={handleTicketPurchase}
            />
          )}
          
          {!event.published && canEditEvent && (
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <div className="mb-4 text-amber-600 font-medium">⚠️ This event is not published</div>
              <p className="text-gray-600 mb-4">
                This event is currently in draft mode and is only visible to you and admins.
                Publish your event to make it available to the public.
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsContent;
