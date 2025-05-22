
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { MemoryWithRelations } from '@/types/memory';

export const useMemoriesFetch = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchMemories = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setMemories([]);
      return [];
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
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
      
      // Get related data for each memory
      const memoriesWithRelations = await Promise.all(
        data.map(async (memory) => {
          // Fetch content for the memory
          const { data: contentData } = await supabase
            .from('memory_content')
            .select('*')
            .eq('memory_id', memory.id);
            
          // Fetch attendees for the memory
          const { data: attendeesData } = await supabase
            .from('memory_attendees')
            .select('*')
            .eq('memory_id', memory.id);
            
          // Fetch dishes for the memory
          const { data: dishesData } = await supabase
            .from('memory_dishes')
            .select('*')
            .eq('memory_id', memory.id);
          
          return {
            ...memory,
            content: contentData || [],
            attendees: attendeesData || [],
            dishes: dishesData || [],
          } as MemoryWithRelations;
        })
      );
      
      setMemories(memoriesWithRelations);
      return memoriesWithRelations;
    } catch (err) {
      console.error('Error fetching memories:', err);
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  return {
    memories,
    isLoading,
    error,
    fetchMemories
  };
};
