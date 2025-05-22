
import { useMemoriesFetch } from './memories/useMemoriesFetch';
import { useMemoryCreate } from './memories/useMemoryCreate';
import { useMemoryUpdate } from './memories/useMemoryUpdate';
import { useMemoryDelete } from './memories/useMemoryDelete';
import { useMemoryContent } from './memories/useMemoryContent';
import { useCallback } from 'react';
import { MemoryWithRelations } from '@/types/memory';

export const useMemories = () => {
  const { memories, isLoading, error, fetchMemories } = useMemoriesFetch();
  
  // Fix return type issues by creating hooks with correct callback functions
  const { createMemory } = useMemoryCreate(fetchMemories);
  const { updateMemory } = useMemoryUpdate(fetchMemories);
  const { deleteMemory } = useMemoryDelete(fetchMemories);
  const { addMemoryContent } = useMemoryContent(fetchMemories);
  
  // Ensure fetchMemories is memoized properly
  const refetchMemories = useCallback(async () => {
    return await fetchMemories();
  }, [fetchMemories]);

  return {
    memories,
    isLoading,
    error,
    fetchMemories: refetchMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    addMemoryContent,
  };
};
