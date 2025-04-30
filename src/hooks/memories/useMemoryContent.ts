
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MemoryContent } from '@/types/memory';

export const useMemoryContent = (onSuccessCallback?: () => Promise<void>) => {
  const { toast } = useToast();

  const addMemoryContent = async (memoryId: string, contentData: Partial<MemoryContent>) => {
    try {
      if (!contentData.content_type) {
        throw new Error("Content type is required");
      }
      
      const { data, error } = await supabase
        .from('memory_content')
        .insert({
          memory_id: memoryId,
          content_type: contentData.content_type,
          content_url: contentData.content_url,
          content_text: contentData.content_text
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Memory content added successfully.',
      });

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
      
      return data;
    } catch (error: any) {
      console.error('Error adding memory content:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add memory content.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return { addMemoryContent };
};
