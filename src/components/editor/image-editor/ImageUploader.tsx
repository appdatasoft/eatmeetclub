
import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
}

const ImageUploader = ({ onImageUploaded }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      
      // Save the public URL
      if (publicUrlData.publicUrl) {
        onImageUploaded(publicUrlData.publicUrl);
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

  return (
    <div className="w-full">
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
  );
};

export default ImageUploader;
