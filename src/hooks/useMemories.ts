
import { useMemoriesFetch } from './memories/useMemoriesFetch';
import { useMemoryCreate } from './memories/useMemoryCreate';
import { useMemoryUpdate } from './memories/useMemoryUpdate';
import { useMemoryDelete } from './memories/useMemoryDelete';
import { useMemoryContent } from './memories/useMemoryContent';
import { useCallback } from 'react';
import { MemoryWithRelations } from '@/types/memory';

// Define callback type for memory operations
type MemoriesCallback = () => Promise<MemoryWithRelations[]>;

export const useMemories = () => {
  const { memories, isLoading, error, fetchMemories } = useMemoriesFetch();
  
  // Create custom callback that can be passed to child hooks
  const refetchCallback = useCallback<MemoriesCallback>(async () => {
    return await fetchMemories();
  }, [fetchMemories]);
  
  // Use our typed callback for all memory operations
  const { createMemory } = useMemoryCreate(refetchCallback);
  const { updateMemory } = useMemoryUpdate(refetchCallback);
  const { deleteMemory } = useMemoryDelete(refetchCallback);
  const { addMemoryContent } = useMemoryContent(refetchCallback);
  
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
