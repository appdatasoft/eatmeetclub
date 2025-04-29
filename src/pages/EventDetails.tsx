
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
import { Edit, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, ChangeEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { event, loading, isPaymentProcessing, handleBuyTickets, isCurrentUserOwner, refreshEventDetails } = useEventDetails(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditCoverDialogOpen, setIsEditCoverDialogOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  const handleEditEvent = () => {
    // Navigate to edit event page (to be implemented)
    // For now just go to dashboard
    navigate(`/dashboard`);
  };
  
  const handleEditCover = () => {
    setIsEditCoverDialogOpen(true);
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverFile(e.target.files[0]);
    }
  };
  
  const handleSaveCover = async () => {
    if (!coverFile || !event) return;
    
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
      setCoverFile(null);
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
                onChange={handleFileChange}
              />
              {coverFile && (
                <div className="relative mt-2 rounded-md overflow-hidden h-40">
                  <img 
                    src={URL.createObjectURL(coverFile)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Recommended image size: 1200 x 600px. Max file size: 5MB
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCoverDialogOpen(false)} disabled={isUploadingCover}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveCover} 
              disabled={!coverFile || isUploadingCover}
            >
              {isUploadingCover ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" /> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventDetails;
