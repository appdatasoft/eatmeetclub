
import { ReactNode, useState } from "react";
import { Pencil } from "lucide-react";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import BackgroundImageEditor from "@/components/editor/BackgroundImageEditor";
import DiningScene from "@/assets/dining-scene.svg";

type HeroProps = {
  children?: ReactNode;
};

const Hero = ({ children }: HeroProps) => {
  const { contentMap, editModeEnabled, canEdit, saveContent } = useEditableContent();
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [isEditingHeroImage, setIsEditingHeroImage] = useState(false);

  // Use the uploaded image as the default hero image if nothing is set
  const heroImagePath = contentMap["hero-image"]?.content || "/lovable-uploads/d2ff6546-a0ca-4e5e-93fa-6e16f8a92466.png";

  const handleEditBackground = () => {
    if (!editModeEnabled) return;
    setIsEditingBackground(true);
  };

  const handleEditHeroImage = () => {
    if (!editModeEnabled) return;
    setIsEditingHeroImage(true);
  };

  const handleSaveBackground = async (url: string) => {
    if (canEdit) {
      await saveContent("hero-background", url, "image");
      setIsEditingBackground(false);
    }
  };

  const handleSaveHeroImage = async (url: string) => {
    if (canEdit) {
      await saveContent("hero-image", url, "image");
      setIsEditingHeroImage(false);
    }
  };

  return (
    <div 
      className="w-full py-12 md:py-24 relative bg-white"
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <BackgroundImageEditor
        isOpen={isEditingBackground}
        onOpenChange={setIsEditingBackground}
        currentImage={contentMap["hero-background"]?.content || ""}
        onSave={handleSaveBackground}
      />

      <BackgroundImageEditor
        isOpen={isEditingHeroImage}
        onOpenChange={setIsEditingHeroImage}
        currentImage={heroImagePath}
        onSave={handleSaveHeroImage}
      />

      <div className="container-custom relative z-10 mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          <div className="w-full md:w-1/2">
            {children}
          </div>

          <div className="w-full md:w-1/2 flex justify-center relative group">
            <img
              src={heroImagePath}
              alt="People dining together"
              className="max-w-full h-auto rounded-lg shadow-xl"
              style={{ maxHeight: "500px" }}
            />
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
