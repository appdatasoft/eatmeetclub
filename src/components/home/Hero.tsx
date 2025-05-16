
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import BackgroundImageEditor from "@/components/editor/BackgroundImageEditor";
import HeroContent from "./HeroContent";
import DiningScene from "@/assets/dining-scene.svg";

const Hero = () => {
  const { contentMap, editModeEnabled, handleSave, canEdit } = useEditableContent();
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  
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
    }
  };

  return (
    <div 
      className="w-full py-12 md:py-24 relative bg-[#703E1E]/10"
      style={{ 
        backgroundImage: editModeEnabled ? `url('${backgroundImage}')` : 'none',
        backgroundOpacity: 0.1,
        backgroundBlendMode: "multiply"
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
      <BackgroundImageEditor 
        isOpen={isEditingBackground}
        onOpenChange={setIsEditingBackground}
        currentImage={backgroundImage}
        onSave={handleSaveBackground}
      />
      
      <div className="container-custom relative z-10 mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          {/* Left Column - Content */}
          <div className="w-full md:w-1/2">
            <HeroContent />
          </div>
          
          {/* Right Column - Image */}
          <div className="w-full md:w-1/2 flex justify-center">
            <img 
              src={contentMap["hero-image"]?.content || DiningScene} 
              alt="People dining together" 
              className="max-w-full h-auto rounded-lg shadow-xl"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
