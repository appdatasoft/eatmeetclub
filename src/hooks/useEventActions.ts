
// Import additional hooks for affiliate tracking
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { EventDetails } from "./types/eventTypes";
import { useReferralTracking } from "./useReferralTracking";

export const useEventActions = (
  event: EventDetails | undefined,
  refreshEventDetails: () => Promise<void>,
  canEditEvent: boolean,
  user: User | null
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditCoverDialogOpen, setIsEditCoverDialogOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  // Get referral tracking
  const { getStoredReferralCode } = useReferralTracking();

  // Handle when a user clicks the edit button
  const handleEditEvent = () => {
    if (event && canEditEvent) {
      navigate(`/dashboard/events/edit/${event.id}`);
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this event.",
        variant: "destructive",
      });
    }
  };

  // Handle when a user clicks the edit cover button
  const handleEditCover = () => {
    if (canEditEvent) {
      setIsEditCoverDialogOpen(true);
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this event.",
        variant: "destructive",
      });
    }
  };

  // Handle saving a new cover image
  const handleSaveCover = async (file: File) => {
    if (!event || !canEditEvent) return;
    
    setIsUploadingCover(true);
    
    try {
      // Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${event.id}-cover-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `event-covers/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);
        
      if (!data.publicUrl) throw new Error("Failed to get public URL");
      
      // Update the event with the new cover image
      const { error: updateError } = await supabase
        .from('events')
        .update({ cover_image: data.publicUrl })
        .eq('id', event.id);
        
      if (updateError) throw updateError;
      
      // Refresh event details
      await refreshEventDetails();
      
      toast({
        title: "Cover Updated",
        description: "The event cover image has been updated.",
      });
      
      setIsEditCoverDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating cover:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update cover image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async () => {
    if (!event || !canEditEvent) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
        
      if (error) throw error;
      
      toast({
        title: "Event Deleted",
        description: "The event has been permanently deleted.",
      });
      
      navigate('/dashboard/events');
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete the event.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle ticket purchase
  const handleTicketPurchase = async (ticketCount: number) => {
    if (!event) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tickets.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    setIsPaymentProcessing(true);
    
    try {
      // Get the Supabase URL from environment or fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session found');
      
      // Calculate price
      const totalAmount = ticketCount * event.price;
      const serviceFee = totalAmount * 0.05; // 5% service fee
      
      // Check for referral code from sessionStorage
      const referralCode = getStoredReferralCode(event.id);
      
      // Create payment session
      const response = await fetch(`${supabaseUrl}/functions/v1/create-ticket-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity: ticketCount,
          returnUrl: window.location.origin + '/ticket-success',
          referralCode: referralCode || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment session');
      }
      
      const result = await response.json();
      
      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error('No payment URL returned');
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment.",
        variant: "destructive",
      });
      setIsPaymentProcessing(false);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    isEditCoverDialogOpen, 
    setIsEditCoverDialogOpen,
    isUploadingCover,
    isPaymentProcessing,
    handleEditEvent,
    handleEditCover,
    handleSaveCover,
    handleDeleteEvent,
    handleTicketPurchase,
  };
};

export default useEventActions;
