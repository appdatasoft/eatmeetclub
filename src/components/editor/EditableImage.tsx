
import React, { useState } from 'react';
import { useEditableContent } from './EditableContentProvider';
import { Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageEditorDialog from './image-editor/ImageEditorDialog';
import { supabase } from '@/integrations/supabase/client';

interface EditableImageProps {
  id: string;
  defaultImage?: string;
  className?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
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
  const { contentMap, canEdit, editModeEnabled } = useEditableContent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get image from contentMap if it exists, otherwise use default
  const imageUrl = contentMap[id]?.content || defaultImage;
  
  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  
  // Shape classes
  const shapeClasses = {
    circle: 'rounded-full',
    square: '',
    rounded: 'rounded-md',
  };
  
  // Placeholder for when no image is available
  const placeholderBg = 'bg-brand-100 flex items-center justify-center';
  const placeholderContent = <Image className="text-brand-500" size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} />;
  
  // Handle saving the uploaded image
  const handleSaveImage = async (url: string) => {
    try {
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
      
      if (error) throw error;
      
      // Update the local content map (this will be handled by the EditableContentProvider re-fetch)
      setIsDialogOpen(false);
      
      // Force a refresh if needed
      window.location.reload();
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };
  
  if (!canEdit && !imageUrl) {
    return null;
  }
  
  return (
    <>
      <div className={`group relative ${editModeEnabled ? 'outline outline-1 outline-dashed outline-blue-300 hover:outline-blue-500' : ''}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt}
            className={`${sizeClasses[size]} ${shapeClasses[shape]} object-cover ${className}`}
          />
        ) : (
          <div className={`${sizeClasses[size]} ${shapeClasses[shape]} ${placeholderBg} ${className}`}>
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
