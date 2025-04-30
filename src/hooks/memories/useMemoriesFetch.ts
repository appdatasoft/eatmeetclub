
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MemoryWithRelations } from '@/types/memory';
import { useAuth } from '@/hooks/useAuth';

export const useMemoriesFetch = () => {
  const [memories, setMemories] = useState<MemoryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMemories = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch memories and related data in one query
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          restaurant:restaurants(*),
          event:events(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      // For each memory, fetch its content, attendees, and dishes
      const memoriesWithRelations = await Promise.all(
        data.map(async (memory) => {
          const [contentResult, attendeesResult, dishesResult] = await Promise.all([
            supabase
              .from('memory_content')
              .select('*')
              .eq('memory_id', memory.id)
              .order('created_at', { ascending: true }),
            supabase
              .from('memory_attendees')
              .select('*')
              .eq('memory_id', memory.id),
            supabase
              .from('memory_dishes')
              .select('*')
              .eq('memory_id', memory.id),
          ]);

          return {
            ...memory,
            content: contentResult.data || [],
            attendees: attendeesResult.data || [],
            dishes: dishesResult.data || [],
          };
        })
      );

      setMemories(memoriesWithRelations);
    } catch (error: any) {
      console.error('Error fetching memories:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load memories.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [user]);

  return {
    memories,
    isLoading,
    error,
    fetchMemories,
  };
};
