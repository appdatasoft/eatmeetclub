
import { ReactNode, useState } from "react";
import { Pencil } from "lucide-react";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import BackgroundImageEditor from "@/components/editor/BackgroundImageEditor";
import DiningScene from "@/assets/dining-scene.svg";
import SupabaseImage from "@/components/common/SupabaseImage";
import { addCacheBuster } from "@/utils/supabaseStorage";

type HeroProps = {
  children?: ReactNode;
};

const Hero = ({ children }: HeroProps) => {
  const { contentMap, editModeEnabled, canEdit, saveContent } = useEditableContent();
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [isEditingHeroImage, setIsEditingHeroImage] = useState(false);

  const backgroundImage =
    contentMap["hero-background"]?.content ||
    "/lovable-uploads/090eb32e-b931-4f8a-a4a5-cf84992c296c.png";
  const heroImage = contentMap["hero-image"]?.content || DiningScene;

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

  // Add cache buster to ensure images are fresh
  const cachedBackgroundImage = addCacheBuster(backgroundImage);
  const cachedHeroImage = addCacheBuster(heroImage);

  return (
    <div 
      className="w-full py-12 md:py-24 relative"
      style={{
        backgroundImage: `url(${cachedBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <BackgroundImageEditor
        isOpen={isEditingBackground}
        onOpenChange={setIsEditingBackground}
        currentImage={backgroundImage}
        onSave={handleSaveBackground}
      />

      <BackgroundImageEditor
        isOpen={isEditingHeroImage}
        onOpenChange={setIsEditingHeroImage}
        currentImage={heroImage}
        onSave={handleSaveHeroImage}
      />

      <div className="container-custom relative z-10 mx-auto">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          <div className="w-full md:w-1/2">
            {children}
          </div>

          <div className="w-full md:w-1/2 flex justify-center relative group">
            {/* Using SupabaseImage for more reliable image loading from Supabase storage */}
            {heroImage.startsWith('http') ? (
              <SupabaseImage
                src={cachedHeroImage}
                alt="People dining together"
                className="max-w-full h-auto rounded-lg shadow-xl"
                width="100%"
                height="500px"
                fallbackSrc="/lovable-uploads/e68dd733-6a42-426b-8156-7c0a0963b7d2.png"
              />
            ) : (
              <img
                src={heroImage}
                alt="People dining together"
                className="max-w-full h-auto rounded-lg shadow-xl"
                style={{ maxHeight: "500px" }}
              />
            )}
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
