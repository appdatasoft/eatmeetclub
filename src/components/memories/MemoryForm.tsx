
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useMemoryMedia } from '@/hooks/useMemoryMedia';
import { useAuth } from '@/hooks/useAuth';
import { Memory } from '@/types/memory';

import { memoryFormSchema, MemoryFormValues } from './schema/memoryFormSchema';
import BasicInfoFields from './form/BasicInfoFields';
import RelatedEntitiesFields from './form/RelatedEntitiesFields';
import PrivacySelector from './form/PrivacySelector';
import PhotoUpload from './form/PhotoUpload';
import SubmitButton from './form/SubmitButton';

interface MemoryFormProps {
  onSubmit: (data: any) => Promise<void>;
  existingMemory?: Memory;
  restaurants: { id: string; name: string }[];
  events: { id: string; title: string }[];
  isLoading: boolean;
}

const MemoryForm = ({
  onSubmit,
  existingMemory,
  restaurants,
  events,
  isLoading,
}: MemoryFormProps) => {
  const { user } = useAuth();
  const { uploadMedia, isUploading } = useMemoryMedia();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const form = useForm<MemoryFormValues>({
    resolver: zodResolver(memoryFormSchema),
    defaultValues: {
      title: existingMemory?.title || '',
      location: existingMemory?.location || '',
      date: existingMemory ? new Date(existingMemory.date) : new Date(),
      privacy: existingMemory?.privacy || 'private',
      event_id: existingMemory?.event_id || undefined,
      restaurant_id: existingMemory?.restaurant_id || undefined,
    },
  });

  const handlePhotoChange = (file?: File) => {
    if (!file) {
      form.setValue('photo', undefined);
      setPhotoPreview(null);
      return;
    }
    
    form.setValue('photo', file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (data: MemoryFormValues) => {
    if (!user) return;
    
    // Handle photo upload if there is one
    let photoUrl = null;
    if (data.photo) {
      photoUrl = await uploadMedia(data.photo, user.id);
    }
    
    const formattedDate = format(data.date, 'yyyy-MM-dd');
    
    // Prepare form data
    const memoryData = {
      title: data.title,
      location: data.location,
      date: formattedDate,
      privacy: data.privacy,
      event_id: data.event_id || null,
      restaurant_id: data.restaurant_id || null,
    };
    
    await onSubmit({ ...memoryData, photoUrl });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <BasicInfoFields form={form} />
        
        <RelatedEntitiesFields 
          form={form}
          restaurants={restaurants}
          events={events} 
        />
        
        <PrivacySelector form={form} />
        
        <PhotoUpload 
          photoPreview={photoPreview} 
          onPhotoChange={handlePhotoChange} 
        />
        
        <SubmitButton 
          isLoading={isLoading} 
          isUploading={isUploading}
          isEditMode={!!existingMemory}
        />
      </form>
    </Form>
  );
};

import { format } from 'date-fns';

export default MemoryForm;
