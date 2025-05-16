
import { useState, useRef } from "react";
import { Upload, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BackgroundImageEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage: string;
  onSave: (url: string) => Promise<void>;
}

const BackgroundImageEditor = ({
  isOpen,
  onOpenChange,
  currentImage,
  onSave
}: BackgroundImageEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize preview with current image
  useState(() => {
    if (isOpen) {
      setPreviewImage(currentImage);
    }
  });

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUploadProgress(0);
      setIsUploading(false);
    }
    onOpenChange(open);
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview for selected file
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `hero-backgrounds/${fileName}`;
      
      console.log("Starting upload to bucket: lovable-uploads, path:", filePath);
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Upload successful, getting public URL");
      setUploadProgress(80);
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);
      
      setUploadProgress(100);
      
      // Save the public URL when save is clicked
      if (publicUrlData.publicUrl) {
        // We don't auto-save here, user needs to click save button
        setPreviewImage(publicUrlData.publicUrl);
        console.log("Generated public URL:", publicUrlData.publicUrl);
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // Handle save button click
  const handleSave = async () => {
    if (previewImage) {
      try {
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
      }
    }
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
          {previewImage && (
            <div className="relative w-full mb-4">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full aspect-video object-contain rounded-md bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                onClick={handleChooseFile}
              >
                <Pencil size={16} className="mr-1" /> Edit
              </Button>
            </div>
          )}
          
          {/* File upload input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {/* Choose file button */}
          <button
            onClick={handleChooseFile}
            disabled={isUploading}
            className="flex items-center justify-center w-full py-3 px-4 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload size={18} className="mr-2" /> Choose File
          </button>
          
          {/* Upload progress indicator */}
          {isUploading && (
            <div className="mt-4 w-full">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center mt-1 text-gray-600">
                {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload complete!'}
              </p>
            </div>
          )}
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

export default BackgroundImageEditor;
