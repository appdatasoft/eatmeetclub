import { useParams, useNavigate } from "react-router-dom";
import { useEventDetails } from "@/hooks/useEventDetails";
import { useAuth } from "@/hooks/useAuth";
import { useEventAccess } from "@/hooks/useEventAccess";
import { useEventActions } from "@/hooks/useEventActions";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useEventPaymentHandler } from "@/hooks/event-payment/useEventPaymentHandler";

// Layout components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";
import EventDetailsContent from "@/components/events/EventDetails/EventDetailsContent";

// Event components
import EventSkeleton from "@/components/events/EventDetails/EventSkeleton";
import EventNotFound from "@/components/events/EventDetails/EventNotFound";
import EventAccessControl from "@/components/events/EventDetails/EventAccessControl";
import DeleteEventDialog from "@/components/events/EventDetails/DeleteEventDialog";
import EditCoverDialog from "@/components/events/EventDetails/EditCoverDialog";
import EventAttendees from "@/components/events/EventDetails/EventAttendees";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const { 
    event, 
    isLoading, 
    error,
    isPaymentProcessing, 
    handleBuyTickets, 
    isCurrentUserOwner, 
    refreshEventDetails 
  } = useEventDetails(id);
  
  // Log the event details for debugging
  useEffect(() => {
    console.log("Event details loaded:", { event, isLoading, error });
  }, [event, isLoading, error]);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading event",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);
  
  const { canEditEvent } = useEventAccess(event);
  
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
    handleTicketPurchase
  } = useEventActions(event, refreshEventDetails, canEditEvent, user);
  
  // Process ticket purchase when user is logged in
  const processTicketPurchase = (ticketCount: number) => {
    console.log("Process ticket purchase called:", ticketCount);
    if (user) {
      console.log("User is logged in, processing purchase");
      handleBuyTickets(ticketCount);
    } else {
      console.log("User is not logged in, redirecting to login");
      // This should be handled by the TicketPurchase component now
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
        <EventNotFound error={error} />
        <Footer />
      </>
    );
  }

  // If event is not published and user is not owner or admin
  if (!event.published && !canEditEvent) {
    return (
      <>
        <Navbar />
        <EventAccessControl isPublished={false} />
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

        <EventDetailsContent
          event={event}
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
        
        {/* Show Event Attendees */}
        {id && (
          <div className="container-custom py-4 md:pb-8">
            <EventAttendees eventId={id} />
          </div>
        )}
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
    </>
  );
};

export default EventDetailsPage;
