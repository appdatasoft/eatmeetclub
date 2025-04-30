
import { useMemoriesFetch } from './memories/useMemoriesFetch';
import { useMemoryCreate } from './memories/useMemoryCreate';
import { useMemoryUpdate } from './memories/useMemoryUpdate';
import { useMemoryDelete } from './memories/useMemoryDelete';
import { useMemoryContent } from './memories/useMemoryContent';

export const useMemories = () => {
  const { memories, isLoading, error, fetchMemories } = useMemoriesFetch();
  const { createMemory } = useMemoryCreate(fetchMemories);
  const { updateMemory } = useMemoryUpdate(fetchMemories);
  const { deleteMemory } = useMemoryDelete(fetchMemories);
  const { addMemoryContent } = useMemoryContent(fetchMemories);

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
