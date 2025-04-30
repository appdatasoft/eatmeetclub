
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import BasicInfoFields from './form/BasicInfoFields';
import PrivacySelector from './form/PrivacySelector';
import DatePickerField from './form/DatePickerField';
import SubmitButton from './form/SubmitButton';
import RelatedEntitiesFields from './form/RelatedEntitiesFields';
import PhotoUpload from './form/PhotoUpload';
import { memoryFormSchema, MemoryFormValues } from './schema/memoryFormSchema';
import { useEffect, useState } from 'react';
import { Memory } from '@/types/memory';

interface MemoryFormProps {
  onSubmit: (data: MemoryFormValues & { photoUrl?: string }) => void;
  isLoading: boolean;
  restaurants: { id: string; name: string }[];
  events: { id: string; title: string }[];
  initialValues?: {
    event_id?: string;
    restaurant_id?: string;
  };
  memory?: Memory;
}

const MemoryForm = ({ 
  onSubmit, 
  isLoading, 
  restaurants,
  events,
  initialValues,
  memory 
}: MemoryFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<MemoryFormValues>({
    resolver: zodResolver(memoryFormSchema),
    defaultValues: memory ? {
      title: memory.title,
      location: memory.location,
      date: memory.date ? new Date(memory.date) : new Date(),
      privacy: memory.privacy || 'private',
      event_id: memory.event_id || '',
      restaurant_id: memory.restaurant_id || '',
    } : {
      title: '',
      location: '',
      date: new Date(),
      privacy: 'private' as const,
      event_id: '',
      restaurant_id: '',
    }
  });
  
  // Apply initial values if provided
  useEffect(() => {
    if (initialValues) {
      if (initialValues.event_id) {
        form.setValue('event_id', initialValues.event_id);
      }
      if (initialValues.restaurant_id) {
        form.setValue('restaurant_id', initialValues.restaurant_id);
      }
    }
  }, [initialValues, form]);

  const handleSubmitForm = async (data: MemoryFormValues) => {
    // Extract file from photo field if it exists
    const photoFile = data.photo as File | undefined;
    let photoUrl;
    
    // If there's a photo file, set uploading state and create object URL
    if (photoFile && photoFile instanceof File) {
      try {
        setIsUploading(true);
        // For demonstration purposes, let's say we already have a function to upload the photo
        // In a real application, you'd implement the file upload logic here
        // photoUrl = await uploadPhoto(photoFile);
        photoUrl = URL.createObjectURL(photoFile);
      } catch (error) {
        console.error('Error uploading photo:', error);
      } finally {
        setIsUploading(false);
      }
    }
    
    // Pass the form data and photo URL to the parent component
    onSubmit({ ...data, photoUrl });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
        <BasicInfoFields form={form} />
        
        <DatePickerField form={form} />
        
        <RelatedEntitiesFields 
          form={form} 
          restaurants={restaurants} 
          events={events}
        />
        
        <PrivacySelector form={form} />
        
        <PhotoUpload form={form} />
        
        <SubmitButton 
          isLoading={isLoading} 
          isUploading={isUploading} 
          isEditMode={!!memory}
        />
      </form>
    </Form>
  );
};

export default MemoryForm;
