
import { useParams, useNavigate } from "react-router-dom";
import { useEventDetails } from "@/hooks/useEventDetails";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Layout components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";

// Event components
import EventDetailsContainer from "@/components/events/EventDetails/EventDetailsContainer";
import TicketPurchase from "@/components/events/EventDetails/TicketPurchase";
import EventSkeleton from "@/components/events/EventDetails/EventSkeleton";
import EventNotFound from "@/components/events/EventDetails/EventNotFound";
import EventActions from "@/components/events/EventDetails/EventActions";
import DeleteEventDialog from "@/components/events/EventDetails/DeleteEventDialog";
import EditCoverDialog from "@/components/events/EventDetails/EditCoverDialog";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    event, 
    loading, 
    isPaymentProcessing, 
    handleBuyTickets, 
    isCurrentUserOwner, 
    refreshEventDetails 
  } = useEventDetails(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditCoverDialogOpen, setIsEditCoverDialogOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // Get current URL for QR code
  const eventUrl = window.location.href;
  
  const handleEditEvent = () => {
    // Navigate to edit event page (to be implemented)
    // For now just go to dashboard
    navigate(`/dashboard`);
  };
  
  const handleEditCover = () => {
    setIsEditCoverDialogOpen(true);
  };
  
  const handleSaveCover = async (coverFile: File) => {
    if (!event) return;
    
    try {
      setIsUploadingCover(true);
      
      // Generate a unique file path for the image
      const fileExt = coverFile.name.split('.').pop();
      const filePath = `${event.id}/${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-covers')
        .upload(filePath, coverFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('event-covers')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // Update the event with the new cover image URL
      const { error: updateError } = await supabase
        .from('events')
        .update({ cover_image: publicUrl })
        .eq('id', event.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Refresh the event details to show the updated image
      await refreshEventDetails();
      
      toast({
        title: "Cover Updated",
        description: "Event cover image has been updated successfully",
      });
      
      setIsEditCoverDialogOpen(false);
    } catch (error: any) {
      console.error("Error uploading cover image:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload cover image",
        variant: "destructive"
      });
    } finally {
      setIsUploadingCover(false);
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!event) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
        
      if (error) throw error;
      
      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted",
      });
      
      // Navigate back to events list
      navigate('/events');
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
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

  if (!event) {
    return (
      <>
        <Navbar />
        <EventNotFound />
        <Footer />
      </>
    );
  }

  const ticketsRemaining = event.capacity - (event.tickets_sold || 0);
  const ticketsPercentage = ((event.tickets_sold || 0) / event.capacity) * 100;
  const location = `${event.restaurant.address}, ${event.restaurant.city}, ${event.restaurant.state} ${event.restaurant.zipcode}`;
  const coverImageUrl = event.cover_image || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60";

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <EventHeader 
          title={event.title} 
          restaurantName={event.restaurant.name} 
          isOwner={isCurrentUserOwner}
          onEditCover={handleEditCover}
          coverImage={coverImageUrl}
        />

        <div className="container-custom py-4 md:py-8">
          {isCurrentUserOwner && (
            <EventActions
              eventUrl={eventUrl}
              eventTitle={event.title}
              onEditEvent={handleEditEvent}
              onDeleteEvent={() => setIsDeleteDialogOpen(true)}
            />
          )}
          
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 lg:grid-cols-3">
            {/* Main content */}
            <EventDetailsContainer
              event={event}
              ticketsRemaining={ticketsRemaining}
              ticketsPercentage={ticketsPercentage}
              location={location}
              eventUrl={eventUrl}
              isCurrentUserOwner={isCurrentUserOwner}
            />

            {/* Ticket purchase sidebar */}
            <div className="lg:col-span-1">
              <TicketPurchase 
                price={event.price}
                ticketsRemaining={ticketsRemaining}
                onBuyTickets={handleBuyTickets}
                isPaymentProcessing={isPaymentProcessing}
              />
            </div>
          </div>
        </div>
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

export default EventDetails;
