
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "@/hooks/useEventDetails";
import { useEventManagement } from "./events/useEventManagement";
import { useEventCoverImage } from "./events/useEventCoverImage";

export const useEventActions = (
  event: EventDetails | null,
  refreshEventDetails: () => Promise<void>,
  canEditEvent: boolean,
  user: any | null
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Extract event management functionality to dedicated hook
  const { handleEditEvent, handleDeleteEvent } = useEventManagement(
    event,
    refreshEventDetails,
    canEditEvent,
    navigate,
    isDeleting,
    setIsDeleting,
    setIsDeleteDialogOpen
  );
  
  // Extract cover image functionality to dedicated hook
  const {
    isEditCoverDialogOpen,
    setIsEditCoverDialogOpen,
    isUploadingCover,
    handleEditCover,
    handleSaveCover
  } = useEventCoverImage(event, refreshEventDetails);
  
  // Handle ticket purchase for non-logged in users
  const handleTicketPurchase = (ticketCount: number) => {
    if (!event) return;
    
    if (!user) {
      // Store event ID and ticket count in local storage
      localStorage.setItem('pendingTicketPurchase', JSON.stringify({
        eventId: event.id,
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
    
    // If user is logged in, let EventDetailsPage handle the purchase
    return ticketCount;
  };

  return {
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
  };
};
