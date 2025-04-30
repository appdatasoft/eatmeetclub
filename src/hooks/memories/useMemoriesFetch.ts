
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

      // First fetch just the memories without any nested relations
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (memoriesError) throw memoriesError;

      if (memoriesData.length === 0) {
        // No memories found, return empty array
        setMemories([]);
        setIsLoading(false);
        return;
      }

      // Get memory IDs to use in subsequent queries
      const memoryIds = memoriesData.map(memory => memory.id);
      
      // Fetch related data separately to avoid recursion issues
      const [
        contentResult, 
        restaurantsResult, 
        eventsResult
      ] = await Promise.all([
        supabase
          .from('memory_content')
          .select('*')
          .in('memory_id', memoryIds)
          .order('created_at', { ascending: true }),
        supabase
          .from('restaurants')
          .select('*')
          .in('id', memoriesData.filter(m => m.restaurant_id).map(m => m.restaurant_id)),
        supabase
          .from('events')
          .select('*')
          .in('id', memoriesData.filter(m => m.event_id).map(m => m.event_id))
      ]);

      // Map the related data to each memory
      const memoriesWithRelations = memoriesData.map(memory => {
        return {
          ...memory,
          content: contentResult.data?.filter(c => c.memory_id === memory.id) || [],
          restaurant: restaurantsResult.data?.find(r => r.id === memory.restaurant_id),
          event: eventsResult.data?.find(e => e.id === memory.event_id),
          // Avoid fetching attendees for now as it causes the recursion
          attendees: []
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
