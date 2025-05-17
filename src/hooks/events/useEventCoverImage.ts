
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "@/hooks/types/eventTypes";

export const useEventCoverImage = (
  event: EventDetails | null,
  refreshEventDetails: () => Promise<void>,
) => {
  const [isEditCoverDialogOpen, setIsEditCoverDialogOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
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

  return {
    isEditCoverDialogOpen,
    setIsEditCoverDialogOpen,
    isUploadingCover,
    handleEditCover,
    handleSaveCover
  };
};
