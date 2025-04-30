import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEventDetails } from "@/hooks/useEventDetails";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";

// Layout components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";

// Event components
import EventDetailsContainer from "@/components/events/EventDetails/EventDetailsContainer";
import TicketPurchase from "@/components/events/EventDetails/TicketPurchase";
import EventSkeleton from "@/components/events/EventDetails/EventSkeleton";
import EventNotFound from "@/components/events/EventDetails/EventNotFound";
import EventActionButtons from "@/components/events/EventDetails/EventActionButtons";
import DeleteEventDialog from "@/components/events/EventDetails/DeleteEventDialog";
import EditCoverDialog from "@/components/events/EventDetails/EditCoverDialog";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    event, 
    isLoading, 
    isPaymentProcessing, 
    handleBuyTickets, 
    isCurrentUserOwner, 
    refreshEventDetails 
  } = useEventDetails(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, isAdmin } = useAuth();
  
  // State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditCoverDialogOpen, setIsEditCoverDialogOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [canEditEvent, setCanEditEvent] = useState(false);
  
  // Get current URL for QR code
  const eventUrl = window.location.href;
  
  useEffect(() => {
    if (event && user) {
      // Check if user is owner or admin
      const isOwner = event.user_id === user.id;
      setCanEditEvent(isOwner || isAdmin);
    } else {
      setCanEditEvent(false);
    }
  }, [event, user, isAdmin]);
  
  useEffect(() => {
    // Check if this event is published, if not, only owners and admins can view
    const checkAccess = async () => {
      if (!id) return;
      if (!user) return; // Public users can only see published events
      
      try {
        // If we have event data already from useEventDetails, use that
        if (event && !event.published) {
          // For unpublished events, check if user is owner or admin
          const isOwner = event.user_id === user.id;
          if (!isOwner && !isAdmin) {
            toast({
              title: "Access Denied",
              description: "This event is not currently published.",
              variant: "destructive"
            });
            navigate('/events');
          }
        }
      } catch (error) {
        console.error("Error checking event access:", error);
      }
    };
    
    checkAccess();
  }, [event, id, user, navigate, toast, isAdmin]);
  
  const handleEditEvent = () => {
    navigate(`/edit-event/${id}`);
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
    
    // Check if user can delete this event
    if (!canEditEvent) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete this event",
        variant: "destructive"
      });
      return;
    }
    
    // Published events cannot be deleted unless by admin
    if (event.published && !isAdmin) {
      toast({
        title: "Cannot Delete",
        description: "Published events cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
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
      navigate('/dashboard');
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
  
  // Handle ticket purchase for non-logged in users
  const handleTicketPurchase = (ticketCount: number) => {
    if (!user) {
      // Store event ID and ticket count in local storage
      localStorage.setItem('pendingTicketPurchase', JSON.stringify({
        eventId: id,
        ticketCount: ticketCount,
        redirectPath: location.pathname
      }));
      
      // Redirect to login page
      toast({
        title: "Login Required",
        description: "Please log in or become a member to purchase tickets",
      });
      
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    // User is logged in, proceed with ticket purchase
    handleBuyTickets(ticketCount);
  };

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

  if (!event) {
    return (
      <>
        <Navbar />
        <EventNotFound />
        <Footer />
      </>
    );
  }

  // If event is not published and user is not owner or admin
  // This is a backup check in case the useEffect didn't redirect
  if (!event.published && !canEditEvent) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Available</h1>
          <p className="mb-6">This event is not currently published.</p>
          <Button 
            variant="default"
            onClick={() => navigate('/events')}
          >
            Back to Events
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const ticketsRemaining = event.capacity - (event.tickets_sold || 0);
  const ticketsPercentage = ((event.tickets_sold || 0) / event.capacity) * 100;
  const locationStr = `${event.restaurant.address}, ${event.restaurant.city}, ${event.restaurant.state} ${event.restaurant.zipcode}`;
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

        <div className="container-custom py-4 md:py-8">
          {canEditEvent && (
            <EventActionButtons
              eventUrl={eventUrl}
              eventTitle={event.title}
              onEditEvent={handleEditEvent}
              onDeleteEvent={() => setIsDeleteDialogOpen(true)}
              isPublished={event.published}
            />
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
