
import { useParams } from "react-router-dom";
import { useEventDetails } from "@/hooks/useEventDetails";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";
import EventInfo from "@/components/events/EventDetails/EventInfo";
import RestaurantInfo from "@/components/events/EventDetails/RestaurantInfo";
import TicketPurchase from "@/components/events/EventDetails/TicketPurchase";
import EventSkeleton from "@/components/events/EventDetails/EventSkeleton";
import EventNotFound from "@/components/events/EventDetails/EventNotFound";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { event, loading, isPaymentProcessing, handleBuyTickets, isCurrentUserOwner } = useEventDetails(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditCoverDialogOpen, setIsEditCoverDialogOpen] = useState(false);
  
  const handleEditEvent = () => {
    // Navigate to edit event page (to be implemented)
    // For now just go to dashboard
    navigate(`/dashboard`);
  };
  
  const handleEditCover = () => {
    setIsEditCoverDialogOpen(true);
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
        <div className="container-custom py-12">
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

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <EventHeader 
          title={event.title} 
          restaurantName={event.restaurant.name} 
          isOwner={isCurrentUserOwner}
          onEditCover={handleEditCover}
        />

        <div className="container-custom py-8">
          {isCurrentUserOwner && (
            <div className="flex justify-end mb-4 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center" 
                onClick={handleEditEvent}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
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
                name={event.restaurant.name} 
                description={event.restaurant.description}
              />
            </div>

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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEvent} 
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Cover Dialog */}
      <Dialog open={isEditCoverDialogOpen} onOpenChange={setIsEditCoverDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Edit Cover Image</DialogTitle>
            <DialogDescription>
              Upload a new cover image for your event
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-4">
              <input
                type="file"
                accept="image/*"
                className="w-full"
                // In a real implementation, this would handle the file upload
              />
              <p className="text-sm text-muted-foreground">
                Recommended image size: 1200 x 600px. Max file size: 5MB
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCoverDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventDetails;
