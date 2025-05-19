
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import BackgroundImageEditor from "@/components/editor/BackgroundImageEditor";
import HeroContent from "./HeroContent";
import DiningScene from "@/assets/dining-scene.svg";

const Hero = () => {
  const { contentMap, editModeEnabled, canEdit, saveContent } = useEditableContent();
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [isEditingHeroImage, setIsEditingHeroImage] = useState(false);
  
  // Get background image from content map or use the uploaded image as default
  const backgroundImage = contentMap["hero-background"]?.content || "/lovable-uploads/090eb32e-b931-4f8a-a4a5-cf84992c296c.png";
  // Get hero image from content map or use default
  const heroImage = contentMap["hero-image"]?.content || DiningScene;

  // Handler to open background image editor
  const handleEditBackground = () => {
    if (!editModeEnabled) return;
    setIsEditingBackground(true);
  };

  // Handler to open hero image editor
  const handleEditHeroImage = () => {
    if (!editModeEnabled) return;
    setIsEditingHeroImage(true);
  };

  // Handler to save background image
  const handleSaveBackground = async (url: string) => {
    if (canEdit) {
      await saveContent("hero-background", url, "image");
      setIsEditingBackground(false);
    }
  };

  // Handler to save hero image
  const handleSaveHeroImage = async (url: string) => {
    if (canEdit) {
      await saveContent("hero-image", url, "image");
      setIsEditingHeroImage(false);
    }
  };

  return (
    <div className="w-full py-12 md:py-24 relative">
      {/* Background image editor dialog */}
      <BackgroundImageEditor 
        isOpen={isEditingBackground}
        onOpenChange={setIsEditingBackground}
        currentImage={backgroundImage}
        onSave={handleSaveBackground}
      />

      {/* Hero image editor dialog */}
      <BackgroundImageEditor 
        isOpen={isEditingHeroImage}
        onOpenChange={setIsEditingHeroImage}
        currentImage={heroImage}
        onSave={handleSaveHeroImage}
      />
      
      <div className="container-custom relative z-10 mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          {/* Left Column - Content */}
          <div className="w-full md:w-1/2">
            <HeroContent />
          </div>
          
          {/* Right Column - Image */}
          <div className="w-full md:w-1/2 flex justify-center relative group">
            <img 
              src={heroImage} 
              alt="People dining together" 
              className="max-w-full h-auto rounded-lg shadow-xl"
              style={{ maxHeight: '500px' }}
            />
            
            {/* Hero image edit button for admins - Fixed to be visible when in edit mode */}
            {editModeEnabled && canEdit && (
              <button 
                className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full z-20 transition-opacity"
                onClick={handleEditHeroImage}
                aria-label="Edit Hero Image"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
