
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Memory, MemoryWithRelations } from '@/types/memory';
import { useAuth } from '@/hooks/useAuth';

export const useMemoryCreate = (onSuccessCallback?: () => Promise<MemoryWithRelations[]>) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const createMemory = async (memoryData: Partial<Memory>) => {
    if (!user) return null;

    try {
      // Make sure required fields are present
      if (!memoryData.title || !memoryData.date || !memoryData.location) {
        throw new Error("Title, date, and location are required");
      }

      const { data, error } = await supabase
        .from('memories')
        .insert({
          title: memoryData.title,
          date: memoryData.date,
          location: memoryData.location,
          privacy: memoryData.privacy || 'private',
          event_id: memoryData.event_id,
          restaurant_id: memoryData.restaurant_id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Memory created successfully.',
      });

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
      
      return data;
    } catch (error: any) {
      console.error('Error creating memory:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create memory.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return { createMemory };
};
