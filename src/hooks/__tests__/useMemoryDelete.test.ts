
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMemoryDelete } from '../memories/useMemoryDelete';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis()
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

describe('useMemoryDelete hook', () => {
  const mockToast = { toast: vi.fn() };
  const mockCallback = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    (useToast as any).mockReturnValue(mockToast);
  });

  it('should delete a memory successfully', async () => {
    // Mock successful deletion
    (supabase.from as any).mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null })
    });
    
    const { result } = renderHook(() => useMemoryDelete(mockCallback));
    
    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteMemory('memory-123');
    });
    
    expect(deleteResult).toBe(true);
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Memory deleted successfully.'
    });
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should handle deletion error', async () => {
    // Mock deletion error
    const error = { message: 'Failed to delete' };
    (supabase.from as any).mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error })
    });
    
    const { result } = renderHook(() => useMemoryDelete(mockCallback));
    
    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteMemory('memory-123');
    });
    
    expect(deleteResult).toBe(false);
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to delete',
      variant: 'destructive'
    });
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should work without a callback function', async () => {
    // Mock successful deletion
    (supabase.from as any).mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null })
    });
    
    // Render hook without callback
    const { result } = renderHook(() => useMemoryDelete());
    
    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteMemory('memory-123');
    });
    
    expect(deleteResult).toBe(true);
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Memory deleted successfully.'
    });
  });
});
