
import React, { ChangeEvent, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface EditCoverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  isUploading: boolean;
}

const EditCoverDialog: React.FC<EditCoverDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isUploading
}) => {
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (coverFile) {
      await onSave(coverFile);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border shadow-lg" style={{ backgroundColor: "white" }}>
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
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
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
