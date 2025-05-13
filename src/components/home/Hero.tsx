
import { Button } from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import EditableText from "@/components/editor/EditableText";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import { useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const { contentMap, editModeEnabled, handleEdit, handleSave, canEdit } = useEditableContent();
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  
  // Get background image from content map or use default
  const backgroundImage = contentMap["hero-background"]?.content || "/assets/images/hero-bg.png";

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
    }
  };

  // Handler to cancel editing background
  const handleCancelBackground = () => {
    setIsEditingBackground(false);
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
          className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-md z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleEditBackground}
        >
          Edit Background
        </button>
      )}

      {/* Background image editor modal */}
      {isEditingBackground && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit Background Image</h3>
            <p className="mb-2 text-sm text-gray-600">Enter the URL for the background image:</p>
            <input 
              type="text" 
              className="w-full border p-2 mb-4 rounded" 
              defaultValue={backgroundImage}
              id="background-url-input"
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCancelBackground}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById("background-url-input") as HTMLInputElement;
                  handleSaveBackground(input.value);
                }}
              >
                Save
              </Button>
            </div>
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
