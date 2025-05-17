
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import EventDetailsContainer from "./EventDetailsContainer";
import TicketPurchase from "./TicketPurchase";
import EventActionButtons from "./EventActionButtons";
import UnpublishedEventNotice from "./UnpublishedEventNotice";
import { useIsMobile } from "@/hooks/use-mobile";
import { EventDetails } from "@/types/event";
import RestaurantInfo from "./RestaurantInfo";
import { BookPlus, Menu, Utensils, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import RestaurantMenuPreview from "../RestaurantMenuPreview";

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
  
  const locationStr = `${event.restaurant.address}, ${event.restaurant.city}, ${event.restaurant.state} ${event.restaurant.zipcode}`;

  const handleCreateMemory = () => {
    if (user) {
      navigate(`/dashboard/create-memory?event=${event.id}&restaurant=${event.restaurant.id}`);
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  const handleAddMenu = () => {
    navigate(`/dashboard/restaurant-menu/${event.restaurant.id}?eventId=${event.id}`);
  };

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
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Attendees</span>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {event.tickets_sold || 0} / {event.capacity}
                </Badge>
              </div>
              
              {/* Create Memory button - only for logged in users */}
              {user && (
                <Button 
                  onClick={handleCreateMemory}
                  variant="outline" 
                  className="mb-4 w-full flex items-center gap-2"
                >
                  <BookPlus className="h-4 w-4" />
                  <span>Create Memory for this Event</span>
                </Button>
              )}
              
              {/* View Restaurant Menu button - Available for all users */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="mb-4 w-full flex items-center gap-2"
                  >
                    <Utensils className="h-4 w-4" />
                    <span>View Restaurant Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md md:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>Menu: {event.restaurant.name}</SheetTitle>
                    <SheetDescription>
                      Browse the restaurant's menu items
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 pr-6">
                    <RestaurantMenuPreview restaurantId={event.restaurant.id} />
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Add Menu button - only show if user is logged in and is the owner of the event */}
              {user && isCurrentUserOwner && (
                <Button 
                  onClick={handleAddMenu}
                  variant="outline" 
                  className="mb-4 w-full flex items-center gap-2"
                >
                  <Menu className="h-4 w-4" />
                  <span>Manage Restaurant Menu</span>
                </Button>
              )}
              
              <TicketPurchase 
                price={event.price}
                ticketsRemaining={ticketsRemaining}
                onBuyTickets={handleTicketPurchase}
                isPaymentProcessing={isPaymentProcessing}
                isLoggedIn={!!user}
              />
            </>
          )}
          
          {!event.published && canEditEvent && (
            <UnpublishedEventNotice />
          )}

          {/* Restaurant info */}
          <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
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
            <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
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
