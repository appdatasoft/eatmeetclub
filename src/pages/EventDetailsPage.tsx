import { useParams, useNavigate } from "react-router-dom";
import { useEventFetch } from "@/hooks/useEventFetch";
import { useAuth } from "@/hooks/useAuth";
import { useEventAccess } from "@/hooks/useEventAccess";
import { useEventActions } from "@/hooks/useEventActions";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

// Layout components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";
import EventDetailsContent from "@/components/events/EventDetails/EventDetailsContent";

// Event components
import EventSkeleton from "@/components/events/EventDetails/EventSkeleton";
import EventNotFound from "@/components/events/EventDetails/EventNotFound";
import DeleteEventDialog from "@/components/events/EventDetails/DeleteEventDialog";
import EditCoverDialog from "@/components/events/EventDetails/EditCoverDialog";
import MenuSelectionModal from "@/components/events/menu-selection";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Menu as MenuIcon } from "lucide-react";

// Import types
import { EventDetails } from "@/hooks/types/eventTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    event, 
    isLoading, 
    error,
    isCurrentUserOwner, 
    refreshEventDetails 
  } = useEventFetch(id);
  
  const [isMenuSelectionOpen, setIsMenuSelectionOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Show error toast if there's an error that's not a "not found" error
  useEffect(() => {
    if (error && !error.includes("not found") && !error.includes("Invalid")) {
      toast({
        title: "Error loading event",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);
  
  const { canEditEvent } = useEventAccess(event as EventDetails);
  
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    isEditCoverDialogOpen,
    setIsEditCoverDialogOpen,
    isUploadingCover,
    handleEditEvent,
    handleEditCover,
    handleSaveCover,
    handleDeleteEvent,
    handleTicketPurchase,
    isPaymentProcessing,
  } = useEventActions(event as EventDetails, refreshEventDetails, canEditEvent, user);
  
  // Process ticket purchase when user is logged in
  const processTicketPurchase = (ticketCount: number) => {
    if (user) {
      handleTicketPurchase(ticketCount);
    }
  };
  
  const handleRetry = () => {
    setIsRetrying(true);
    refreshEventDetails()
      .finally(() => setIsRetrying(false));
  };
  
  const handleManageMenu = () => {
    if (event && event.restaurant && event.restaurant.id) {
      navigate(`/dashboard/restaurant-menu/${event.restaurant.id}?eventId=${event.id}&eventName=${encodeURIComponent(event.title)}`);
    } else {
      toast({
        title: "Error",
        description: "Restaurant information is missing",
        variant: "destructive"
      });
    }
  };
  
  // Get current URL for QR code
  const eventUrl = window.location.href;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-8 md:py-12">
          <EventSkeleton />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-8">
          <EventNotFound error={error} />
          {error && !error.includes("not found") && (
            <div className="mt-4">
              <Button 
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry Loading'}
              </Button>
            </div>
          )}
        </div>
        <Footer />
      </>
    );
  }

  // If event is not published and user is not owner or admin
  if (!event.published && !canEditEvent) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Available</h1>
          <p className="mb-6">This event is not currently published.</p>
        </div>
        <Footer />
      </>
    );
  }

  const ticketsRemaining = event.capacity - (event.tickets_sold || 0);
  const ticketsPercentage = ((event.tickets_sold || 0) / event.capacity) * 100;
  const coverImageUrl = event.cover_image || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60";

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <EventHeader 
          title={event.title} 
          restaurantName={event.restaurant.name} 
          restaurantId={event.restaurant.id}
          isOwner={canEditEvent}
          onEditCover={handleEditCover}
          coverImage={coverImageUrl}
        />

        <div className="container-custom pt-4">
          <div className="flex flex-wrap gap-2">
            {user && (
              <Button
                variant="outline"
                className="border-dashed"
                onClick={() => setIsMenuSelectionOpen(true)}
              >
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Select Menu Items
              </Button>
            )}
            
            {canEditEvent && event.restaurant && event.restaurant.id && (
              <Button
                variant="outline"
                onClick={handleManageMenu}
              >
                <MenuIcon className="h-4 w-4 mr-2" />
                Manage Menu
              </Button>
            )}
          </div>
        </div>

        <EventDetailsContent
          event={event as EventDetails}
          ticketsRemaining={ticketsRemaining}
          ticketsPercentage={ticketsPercentage}
          eventUrl={eventUrl}
          isCurrentUserOwner={isCurrentUserOwner}
          canEditEvent={canEditEvent}
          handleTicketPurchase={processTicketPurchase}
          handleEditEvent={handleEditEvent}
          handleDeleteEvent={() => setIsDeleteDialogOpen(true)}
          isPaymentProcessing={isPaymentProcessing}
          user={user}
        />
      </div>
      <Footer />
      
      {/* Dialogs */}
      <DeleteEventDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteEvent}
        isDeleting={isDeleting}
      />
      
      <EditCoverDialog
        isOpen={isEditCoverDialogOpen}
        onClose={() => setIsEditCoverDialogOpen(false)}
        onSave={handleSaveCover}
        isUploading={isUploadingCover}
      />
      
      {event && (
        <MenuSelectionModal
          eventId={event.id}
          restaurantId={event.restaurant.id}
          isOpen={isMenuSelectionOpen}
          onClose={() => setIsMenuSelectionOpen(false)}
        />
      )}
    </>
  );
};

export default EventDetailsPage;
