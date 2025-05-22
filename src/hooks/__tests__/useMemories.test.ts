
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMemories } from '../useMemories';
import { useMemoriesFetch } from '../memories/useMemoriesFetch';
import { useMemoryCreate } from '../memories/useMemoryCreate';
import { useMemoryUpdate } from '../memories/useMemoryUpdate';
import { useMemoryDelete } from '../memories/useMemoryDelete';
import { useMemoryContent } from '../memories/useMemoryContent';

// Mock dependencies
vi.mock('../memories/useMemoriesFetch', () => ({
  useMemoriesFetch: vi.fn()
}));

vi.mock('../memories/useMemoryCreate', () => ({
  useMemoryCreate: vi.fn()
}));

vi.mock('../memories/useMemoryUpdate', () => ({
  useMemoryUpdate: vi.fn()
}));

vi.mock('../memories/useMemoryDelete', () => ({
  useMemoryDelete: vi.fn()
}));

vi.mock('../memories/useMemoryContent', () => ({
  useMemoryContent: vi.fn()
}));

describe('useMemories hook', () => {
  const mockMemories = [
    { id: '1', title: 'Memory 1' },
    { id: '2', title: 'Memory 2' }
  ];
  
  const mockFetchMemories = vi.fn().mockResolvedValue(mockMemories);
  const mockCreateMemory = vi.fn();
  const mockUpdateMemory = vi.fn();
  const mockDeleteMemory = vi.fn();
  const mockAddMemoryContent = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    (useMemoriesFetch as any).mockReturnValue({
      memories: mockMemories,
      isLoading: false,
      error: null,
      fetchMemories: mockFetchMemories
    });
    
    (useMemoryCreate as any).mockImplementation((fetchCallback) => ({
      createMemory: mockCreateMemory
    }));
    
    (useMemoryUpdate as any).mockImplementation((fetchCallback) => ({
      updateMemory: mockUpdateMemory
    }));
    
    (useMemoryDelete as any).mockImplementation((fetchCallback) => ({
      deleteMemory: mockDeleteMemory
    }));
    
    (useMemoryContent as any).mockImplementation((fetchCallback) => ({
      addMemoryContent: mockAddMemoryContent
    }));
  });
  
  it('should combine all memory-related hooks', () => {
    const { result } = renderHook(() => useMemories());
    
    expect(result.current.memories).toEqual(mockMemories);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fetchMemories).toBe('function');
    expect(result.current.createMemory).toBe(mockCreateMemory);
    expect(result.current.updateMemory).toBe(mockUpdateMemory);
    expect(result.current.deleteMemory).toBe(mockDeleteMemory);
    expect(result.current.addMemoryContent).toBe(mockAddMemoryContent);
  });
  
  it('should memoize the fetchMemories function', async () => {
    const { result } = renderHook(() => useMemories());
    
    // Store the initial function reference
    const initialFetchMemories = result.current.fetchMemories;
    
    // Rerender the hook
    const { result: rerenderedResult } = renderHook(() => useMemories());
    
    // The function reference should be the same (memoized)
    expect(rerenderedResult.current.fetchMemories).toBe(initialFetchMemories);
    
    // Call the function and check if it correctly delegates to the original fetchMemories
    await act(async () => {
      await result.current.fetchMemories();
    });
    
    expect(mockFetchMemories).toHaveBeenCalledTimes(1);
  });
  
  it('should initialize child hooks with correct dependencies', () => {
    renderHook(() => useMemories());
    
    // Check that each dependent hook was initialized with the fetchMemories function
    expect(useMemoryCreate).toHaveBeenCalledWith(mockFetchMemories);
    expect(useMemoryUpdate).toHaveBeenCalledWith(mockFetchMemories);
    expect(useMemoryDelete).toHaveBeenCalledWith(mockFetchMemories);
    expect(useMemoryContent).toHaveBeenCalledWith(mockFetchMemories);
  });
});
