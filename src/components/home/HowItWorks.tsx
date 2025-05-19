
import EditableText from "@/components/editor/EditableText";
import { useState } from "react";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import ImageEditorDialog from "@/components/editor/image-editor/ImageEditorDialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { useImageContent } from "@/hooks/useImageContent";

const HowItWorks = () => {
  const [isEditingImage, setIsEditingImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");
  const { editModeEnabled } = useEditableContent();
  const { toast } = useToast();

  // Images for each step with default values
  const defaultImages = {
    "step-1-image": "/lovable-uploads/46144c94-b752-4704-930d-f0c4cf2e68cc.png",
    "step-2-image": "/lovable-uploads/46144c94-b752-4704-930d-f0c4cf2e68cc.png",
    "step-3-image": "/lovable-uploads/46144c94-b752-4704-930d-f0c4cf2e68cc.png",
  };

  const { images, setImages } = useImageContent(window.location.pathname, defaultImages);

  const handleEditImage = (imageId: string, currentSrc: string) => {
    setIsEditingImage(imageId);
    setCurrentImage(currentSrc);
  };

  const handleSaveImage = async (imageUrl: string) => {
    try {
      if (!isEditingImage) return;
      
      // Save to Supabase page_content table
      const { data, error } = await supabase
        .from('page_content')
        .upsert({
          page_path: window.location.pathname,
          element_id: isEditingImage,
          content: imageUrl,
          content_type: 'image',
        });

      if (error) throw error;
      
      // Update local state
      setImages({
        ...images,
        [isEditingImage]: imageUrl
      });
      
      setIsEditingImage(null);
      
    } catch (error) {
      console.error("Error saving image:", error);
      toast({
        title: "Error saving image",
        description: "There was a problem saving your image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const StepImage = ({ id, className = "" }: { id: string, className?: string }) => {
    const imageUrl = images[id] || defaultImages[id];
    
    return (
      <div className={`relative group ${className}`}>
        <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`Step ${id.split('-')[1]}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-brand-500 text-2xl font-bold">
              {id.split('-')[1]}
            </span>
          )}
        </div>
        
        {editModeEnabled && (
          <button
            onClick={() => handleEditImage(id, imageUrl)}
            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit image"
          >
            <Camera size={14} className="text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <EditableText
            id="how-it-works-title"
            tag="h2"
            className="text-3xl font-bold mb-4"
            defaultContent="How It Works"
          />
          <EditableText
            id="how-it-works-subtitle"
            tag="p"
            className="text-gray-600 max-w-2xl mx-auto"
            defaultContent="See how easy it is to connect with others over delicious food and fun games."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <StepImage id="step-1-image" />
            <EditableText
              id="step-1-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Buy Ticket"
            />
            <EditableText
              id="step-1-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Purchase your ticket to upcoming food & game events. Each ticket includes access to the venue, delicious food, and exciting games."
            />
          </div>
          
          <div className="flex flex-col items-center text-center">
            <StepImage id="step-2-image" />
            <EditableText
              id="step-2-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Play Game"
            />
            <EditableText
              id="step-2-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Enjoy an evening of food and interactive gameplay. Experience various games while connecting with like-minded people in a relaxed atmosphere."
            />
          </div>
          
          <div className="flex flex-col items-center text-center">
            <StepImage id="step-3-image" />
            <EditableText
              id="step-3-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Build Local Community"
            />
            <EditableText
              id="step-3-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Create lasting connections in your neighborhood. Turn strangers into friends and establish a vibrant local community centered around shared interests."
            />
          </div>
        </div>
        
        <div className="text-center mt-12">
          <EditableText
            id="cta-text"
            tag="p"
            className="mb-6 text-lg"
            defaultContent="Ready to link up over food & games?"
          />
          <a 
            href="/events" 
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-md transition-colors inline-block"
          >
            Browse Events
          </a>
        </div>
      </div>
      
      {isEditingImage && (
        <ImageEditorDialog 
          isOpen={!!isEditingImage}
          onOpenChange={() => setIsEditingImage(null)}
          currentImage={currentImage}
          onSave={handleSaveImage}
        />
      )}
    </section>
  );
};

export default HowItWorks;
