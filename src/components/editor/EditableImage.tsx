
import React, { useState, useEffect } from 'react';
import { useEditableContent } from './EditableContentProvider';
import { Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageEditorDialog from './image-editor/ImageEditorDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageContent } from '@/hooks/useImageContent';

interface EditableImageProps {
  id: string;
  defaultImage?: string;
  className?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'custom';
  shape?: 'circle' | 'square' | 'rounded';
}

const EditableImage: React.FC<EditableImageProps> = ({
  id,
  defaultImage = '',
  className = '',
  alt = 'Editable image',
  size = 'md',
  shape = 'circle',
}) => {
  const { contentMap, canEdit, editModeEnabled, fetchPageContent } = useEditableContent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Get image from contentMap if it exists, otherwise use default
  const contentImageUrl = contentMap[id]?.content || defaultImage;
  // Use local state if it exists, otherwise use contentMap
  const imageUrl = localImageUrl || contentImageUrl;
  
  // Update local state when contentMap changes
  useEffect(() => {
    if (contentMap[id]?.content) {
      setLocalImageUrl(contentMap[id].content);
    }
  }, [contentMap, id]);
  
  // Size classes - only apply if not using custom className for sizing
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    custom: '', // Custom size will be defined in className
  };
  
  // Shape classes
  const shapeClasses = {
    circle: 'rounded-full',
    square: '',
    rounded: 'rounded-md',
  };
  
  // Placeholder for when no image is available
  const placeholderBg = 'bg-brand-100 flex items-center justify-center';
  const placeholderContent = <Image className="text-brand-500" size={size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 48} />;
  
  // Handle saving the uploaded image
  const handleSaveImage = async (url: string) => {
    try {
      console.log("Saving image to Supabase:", { 
        page_path: window.location.pathname,
        element_id: id,
        url
      });
      
      // Save to Supabase
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_path: window.location.pathname,
          element_id: id,
          content: url,
          content_type: 'image',
        }, {
          onConflict: 'page_path,element_id'
        });
      
      if (error) {
        console.error("Error in upsert operation:", error);
        throw error;
      }
      
      console.log("Image saved successfully");
      
      // Update local state immediately
      setLocalImageUrl(url);
      
      // Show success toast
      toast({
        title: "Image updated",
        description: "Your changes have been saved successfully",
      });
      
      // Fetch the updated content
      fetchPageContent();
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving image:', error);
      
      // Show error toast
      toast({
        title: "Error saving image",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  if (!canEdit && !imageUrl) {
    return null;
  }
  
  // Use the appropriate size class if not custom
  const appliedSizeClass = size === 'custom' ? '' : sizeClasses[size];
  
  return (
    <>
      <div className={`group relative ${editModeEnabled ? 'outline outline-1 outline-dashed outline-blue-300 hover:outline-blue-500' : ''}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            className={`${appliedSizeClass} ${shapeClasses[shape]} object-cover ${className}`}
          />
        ) : (
          <div className={`${appliedSizeClass} ${shapeClasses[shape]} ${placeholderBg} ${className}`}>
            {placeholderContent}
          </div>
        )}
        
        {editModeEnabled && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
            onClick={() => setIsDialogOpen(true)}
            aria-label="Edit image"
          >
            <Upload size={16} />
          </Button>
        )}
      </div>
      
      <ImageEditorDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentImage={imageUrl}
        onSave={handleSaveImage}
      />
    </>
  );
};

export default EditableImage;
