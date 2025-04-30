
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

      // Fetch memories and related data
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          restaurant:restaurants(*),
          event:events(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Get memory IDs to use in subsequent queries
      const memoryIds = data.map(memory => memory.id);
      
      if (memoryIds.length === 0) {
        // No memories found, return empty array
        setMemories([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch all related content for these memories in separate queries to avoid recursion
      const [contentResult, dishesResult] = await Promise.all([
        supabase
          .from('memory_content')
          .select('*')
          .in('memory_id', memoryIds)
          .order('created_at', { ascending: true }),
        supabase
          .from('memory_dishes')
          .select('*')
          .in('memory_id', memoryIds)
      ]);

      // Map the related data to each memory
      const memoriesWithRelations = data.map(memory => {
        return {
          ...memory,
          content: contentResult.data?.filter(c => c.memory_id === memory.id) || [],
          dishes: dishesResult.data?.filter(d => d.memory_id === memory.id) || [],
          attendees: [] // Skip attendees for now to avoid recursion issue
        };
      });

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
    if (user) {
      fetchMemories();
    }
  }, [user]);

  return {
    memories,
    isLoading,
    error,
    fetchMemories,
  };
};
