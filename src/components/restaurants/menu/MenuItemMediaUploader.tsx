
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MediaItem } from "./types/mediaTypes";
import { uploadFileToStorage, deleteFileFromStorage, extractPathFromUrl } from "./utils/uploadUtils";
import MediaPreview from "./MediaPreview";
import UploadButton from "./UploadButton";
import ProgressBar from "./ProgressBar";

interface MediaUploaderProps {
  initialMediaItems?: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  restaurantId: string;
  menuItemId: string;
}

const MenuItemMediaUploader: React.FC<MediaUploaderProps> = ({
  initialMediaItems = [],
  onChange,
  restaurantId,
  menuItemId
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMediaItems);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // Ensure we're using the actual UUID, not a slug derived from the name
  const actualItemId = typeof menuItemId === 'string' && 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(menuItemId) 
      ? menuItemId 
      : undefined;
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const newMediaItems = [...mediaItems];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Calculate progress based on current file
        setProgress(Math.round((i / files.length) * 100));
        
        // Pass the actual UUID if available, otherwise use the name as a folder path only
        const mediaItem = await uploadFileToStorage(file, restaurantId, actualItemId);
        if (mediaItem) {
          newMediaItems.push(mediaItem);
        }
      }
      
      setMediaItems(newMediaItems);
      onChange(newMediaItems);
      
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) have been uploaded`,
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(100);
      
      // Reset file input
      event.target.value = "";
    }
  };
  
  const removeMediaItem = async (index: number) => {
    const item = mediaItems[index];
    
    // Always try to use the stored ID (which should be the full path)
    const filePath = item.id || extractPathFromUrl(item.url);
    
    if (filePath) {
      const deleted = await deleteFileFromStorage(filePath);
      
      if (!deleted) {
        toast({
          title: "Error removing file",
          description: "Could not remove file from storage",
          variant: "destructive",
        });
      }
    }
    
    // Remove from UI regardless of storage deletion success
    const newMediaItems = [...mediaItems];
    newMediaItems.splice(index, 1);
    setMediaItems(newMediaItems);
    onChange(newMediaItems);
    
    toast({
      title: "Media removed",
      description: "The media item has been removed from this menu item",
    });
  };
  
  return (
    <div className="space-y-4">
      <MediaPreview mediaItems={mediaItems} onRemove={removeMediaItem} />
      
      <div>
        <input
          id="media-upload"
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />
        <UploadButton isUploading={isUploading} inputId="media-upload" />
      </div>
      
      <ProgressBar progress={progress} isVisible={isUploading} />
    </div>
  );
};

export default MenuItemMediaUploader;
