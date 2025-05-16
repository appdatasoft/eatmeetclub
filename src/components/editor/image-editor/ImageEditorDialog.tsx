
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "./ImageUploader";
import ImagePreview from "./ImagePreview";

interface ImageEditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage: string;
  onSave: (url: string) => Promise<void>;
}

const ImageEditorDialog = ({
  isOpen,
  onOpenChange,
  currentImage,
  onSave
}: ImageEditorDialogProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Initialize preview with current image when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPreviewImage(currentImage);
    }
  }, [isOpen, currentImage]);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsUploading(false);
    }
    onOpenChange(open);
  };

  // Handle successful image upload
  const handleImageUploaded = (url: string) => {
    setPreviewImage(url);
  };

  // Handle save button click
  const handleSave = async () => {
    if (previewImage) {
      try {
        setIsUploading(true);
        await onSave(previewImage);
        toast({
          title: "Background updated",
          description: "Your changes have been saved successfully",
        });
      } catch (error: any) {
        console.error('Error saving image:', error);
        toast({
          title: "Save failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle choosing a new file
  const handleChooseFile = () => {
    // This is now handled within the ImageUploader component
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">Edit image</DialogTitle>
          <p className="text-gray-500 mt-1">Update the content and click save when you're done.</p>
        </DialogHeader>
        
        <div className="px-6 py-4">
          {/* Image preview */}
          <ImagePreview 
            imageUrl={previewImage} 
            onEditClick={handleChooseFile} 
          />
          
          {/* Image uploader */}
          <ImageUploader onImageUploaded={handleImageUploaded} />
        </div>

        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading || !previewImage}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditorDialog;
