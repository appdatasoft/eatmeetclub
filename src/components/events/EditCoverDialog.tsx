
import React, { ChangeEvent, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import SupabaseImage from "@/components/common/SupabaseImage";

interface EditCoverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  isUploading: boolean;
  currentImage?: string;
}

const EditCoverDialog: React.FC<EditCoverDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isUploading,
  currentImage
}) => {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (coverFile) {
      await onSave(coverFile);
      
      // Clean up object URL to avoid memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  // Clean up object URL when dialog closes
  const handleDialogClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCoverFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
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
            
            {/* Show preview of new file if selected */}
            {previewUrl && (
              <div className="relative mt-2 rounded-md overflow-hidden h-40">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Show current image if available and no new file selected */}
            {!previewUrl && currentImage && (
              <div className="relative mt-2 rounded-md overflow-hidden h-40">
                <SupabaseImage
                  src={currentImage}
                  alt="Current cover"
                  className="w-full h-full object-cover"
                  fallbackSrc="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60"
                />
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Recommended image size: 1200 x 600px. Max file size: 5MB
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={!coverFile || isUploading}
          >
            {isUploading ? (
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
  );
};

export default EditCoverDialog;
