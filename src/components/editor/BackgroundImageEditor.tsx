
import { useState, useRef } from "react";
import { Pencil, Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `hero-backgrounds/${fileName}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      setUploadProgress(80);
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);
      
      setUploadProgress(100);
      
      // Save the public URL
      await onSave(publicUrlData.publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // Cancel editing background
  const handleCancelDialog = () => {
    onOpenChange(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit image</DialogTitle>
          <p className="text-muted-foreground mt-1.5">Update the content and click save when you're done.</p>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-5">
          {/* Image preview */}
          <div className="relative w-full max-w-xs mb-4">
            <img 
              src={currentImage} 
              alt="Current background" 
              className="w-full object-contain rounded-md"
            />
            <button
              onClick={handleChooseFile}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-sm"
              title="Edit"
            >
              <Pencil size={16} className="text-gray-700" />
            </button>
          </div>
          
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
            className="flex items-center justify-center w-full max-w-xs py-2.5 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload size={18} className="mr-2" />
            Choose File
          </button>
          
          {/* Upload progress indicator */}
          {isUploading && (
            <div className="mt-4 w-full max-w-xs">
              <div className="w-full bg-gray-200 rounded-full h-2">
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

        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={handleCancelDialog}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              const input = document.getElementById("background-url-input") as HTMLInputElement;
              if (input && input.value) {
                onSave(input.value);
              }
            }}
            disabled={isUploading}
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
