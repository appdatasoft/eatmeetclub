
import { useParams } from "react-router-dom";
import { useEventFetch } from "@/hooks/eventDetails";
import { useAuth } from "@/hooks/useAuth";
import { useEventAccess } from "@/hooks/useEventAccess";
import { useEventActions } from "@/hooks/useEventActions";
import { useEffect } from "react";
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

// Import types
import { EventDetails } from "@/types/event";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { 
    event, 
    isLoading, 
    error,
    isCurrentUserOwner, 
    refreshEventDetails 
  } = useEventFetch(id);
  
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
  
  const { canEditEvent } = useEventAccess(event as unknown as EventDetails);
  
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
  } = useEventActions(event as unknown as EventDetails, refreshEventDetails, canEditEvent, user);
  
  // Process ticket purchase when user is logged in
  const processTicketPurchase = (ticketCount: number) => {
    if (user) {
      handleTicketPurchase(ticketCount);
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

        <EventDetailsContent
          event={event as unknown as EventDetails}
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
    </>
  );
};

export default EventDetailsPage;
