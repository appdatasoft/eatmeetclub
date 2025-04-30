
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Memory, MemoryContent, MemoryWithRelations } from '@/types/memory';
import { useAuth } from '@/hooks/useAuth';

export const useMemories = () => {
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

      await fetchMemories(); // Refresh memories
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

      await fetchMemories(); // Refresh memories
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

      await fetchMemories(); // Refresh memories
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

  const addMemoryContent = async (memoryId: string, contentData: Partial<MemoryContent>) => {
    try {
      const { data, error } = await supabase
        .from('memory_content')
        .insert({
          memory_id: memoryId,
          ...contentData,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Memory content added successfully.',
      });

      await fetchMemories(); // Refresh memories
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

  useEffect(() => {
    fetchMemories();
  }, [user]);

  return {
    memories,
    isLoading,
    error,
    fetchMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    addMemoryContent,
  };
};
