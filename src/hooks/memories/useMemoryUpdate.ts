
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Memory, MemoryWithRelations } from '@/types/memory';

export const useMemoryUpdate = (onSuccessCallback?: () => Promise<MemoryWithRelations[]>) => {
  const { toast } = useToast();

  const updateMemory = async (memoryId: string, updates: Partial<Memory>) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memoryId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Memory updated successfully.',
      });

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating memory:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update memory.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { updateMemory };
};
