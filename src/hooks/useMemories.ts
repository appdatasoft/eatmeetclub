
import { useMemoriesFetch } from './memories/useMemoriesFetch';
import { useMemoryCreate } from './memories/useMemoryCreate';
import { useMemoryUpdate } from './memories/useMemoryUpdate';
import { useMemoryDelete } from './memories/useMemoryDelete';
import { useMemoryContent } from './memories/useMemoryContent';
import { useCallback } from 'react';

export const useMemories = () => {
  const { memories, isLoading, error, fetchMemories } = useMemoriesFetch();
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
