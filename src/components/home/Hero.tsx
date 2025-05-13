
import { Button } from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import EditableText from "@/components/editor/EditableText";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Upload, Image } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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

  // Handler to cancel editing background
  const handleCancelBackground = () => {
    setIsEditingBackground(false);
    setIsUploading(false);
    setUploadProgress(0);
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
  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

      {/* Background image editor modal */}
      {isEditingBackground && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit Background Image</h3>
            
            <div className="flex flex-col gap-4">
              {/* File upload section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                <button
                  onClick={handleUploadClick}
                  className="flex items-center justify-center w-full p-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors mb-2"
                  disabled={isUploading}
                >
                  <Upload size={20} className="mr-2" />
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload New Image'}
                </button>
                
                <p className="text-sm text-gray-500">or</p>
              </div>

              {/* URL input section */}
              <div>
                <Label htmlFor="background-url-input" className="mb-2 block">Enter image URL:</Label>
                <Input 
                  type="text" 
                  className="w-full border p-2 mb-4 rounded" 
                  defaultValue={backgroundImage}
                  id="background-url-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={handleCancelBackground}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById("background-url-input") as HTMLInputElement;
                  handleSaveBackground(input.value);
                }}
                disabled={isUploading}
              >
                Save
              </Button>
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
