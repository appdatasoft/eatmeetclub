
import { Button } from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import EditableText from "@/components/editor/EditableText";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const Hero = () => {
  const navigate = useNavigate();
  const { contentMap, editModeEnabled, handleEdit, handleSave, canEdit } = useEditableContent();
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get background image from content map or use the uploaded image as default
  const backgroundImage = contentMap["hero-background"]?.content || "/lovable-uploads/090eb32e-b931-4f8a-a4a5-cf84992c296c.png";

  // Handler to open background image editor
  const handleEditBackground = () => {
    if (!editModeEnabled) return;
    setIsEditingBackground(true);
  };

  // Handler to save background image
  const handleSaveBackground = async (url: string) => {
    if (canEdit) {
      await handleSave({
        page_path: window.location.pathname,
        element_id: "hero-background",
        content: url,
        content_type: "image",
      });
      setIsEditingBackground(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
      handleSaveBackground(publicUrlData.publicUrl);
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
    setIsEditingBackground(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Simplified navigation handler without async/await
  const handleJoinClick = () => {
    navigate('/become-member');
  };

  return (
    <div 
      className={`w-full py-12 md:py-24 relative h-[500px] md:h-[700px] bg-cover bg-center ${editModeEnabled ? 'group' : ''}`}
      style={{ 
        backgroundImage: `url('${backgroundImage}')`
      }}
    >
      {/* Background image edit button for admins */}
      {editModeEnabled && canEdit && (
        <button 
          className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleEditBackground}
          aria-label="Edit Background"
        >
          <Pencil size={18} />
        </button>
      )}

      {/* Background image editor dialog */}
      <Dialog open={isEditingBackground} onOpenChange={setIsEditingBackground}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit image</DialogTitle>
            <p className="text-muted-foreground mt-1.5">Update the content and click save when you're done.</p>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-5">
            {/* Image preview */}
            <div className="relative w-full max-w-xs mb-4">
              <img 
                src={backgroundImage} 
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
                  handleSaveBackground(input.value);
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

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="container-custom relative z-10 h-full flex items-center justify-center">
        <div className="flex flex-col items-center text-center w-full">
          <EditableText
            id="hero-title"
            tag="h1"
            className="text-3xl md:text-5xl font-bold text-white mb-3"
            defaultContent="Link Up Over Food & Conversation"
          />
          
          <EditableText
            id="hero-description"
            tag="p"
            className="text-white text-xl md:text-2xl mb-8 max-w-3xl"
            defaultContent="Join us for fun social dining where strangers become friends — while helping local businesses and building vibrant local communities."
          />
          
          <EditableText
            id="hero-button"
            tag="span"
            className="hidden"
            defaultContent="BECOME A MEMBER"
          >
            <Button 
              onClick={handleJoinClick}
              size="lg" 
              className="bg-[#FEC6A1] text-[#703E1E] hover:bg-[#FDE1D3] px-10 py-4 text-xl font-bold rounded-full"
            >
              {contentMap["hero-button"]?.content || "BECOME A MEMBER"}
            </Button>
          </EditableText>
        </div>
      </div>
    </div>
  );
};

export default Hero;
