
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import BackgroundImageEditor from "@/components/editor/BackgroundImageEditor";
import HeroContent from "./HeroContent";

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
      <BackgroundImageEditor 
        isOpen={isEditingBackground}
        onOpenChange={setIsEditingBackground}
        currentImage={backgroundImage}
        onSave={handleSaveBackground}
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="container-custom relative z-10 h-full flex items-center justify-center">
        <HeroContent />
      </div>
    </div>
  );
};

export default Hero;
