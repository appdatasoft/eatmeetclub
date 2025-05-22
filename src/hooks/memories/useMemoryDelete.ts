
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MemoryWithRelations } from '@/types/memory';

export const useMemoryDelete = (onSuccessCallback?: () => Promise<MemoryWithRelations[]>) => {
  const { toast } = useToast();

  const deleteMemory = async (memoryId: string) => {
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Memory deleted successfully.',
      });

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting memory:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete memory.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { deleteMemory };
};
