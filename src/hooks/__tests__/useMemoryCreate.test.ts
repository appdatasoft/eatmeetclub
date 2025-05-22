
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMemoryCreate } from '@/hooks/memories/useMemoryCreate';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

describe('useMemoryCreate hook', () => {
  const mockUser = { id: 'user123', email: 'test@example.com' };
  const mockToast = vi.fn();
  const mockCallback = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useToast as any).mockReturnValue({ toast: mockToast });
  });

  it('should not create memory when user is not authenticated', async () => {
    // Mock unauthenticated state
    (useAuth as any).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => useMemoryCreate(mockCallback));
    
    const response = await result.current.createMemory({
      title: 'Test Memory',
      date: '2023-01-01',
      location: 'Test Location'
    });
    
    // Should return null if user is not authenticated
    expect(response).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const { result } = renderHook(() => useMemoryCreate(mockCallback));
    
    // Missing required fields
    const response = await result.current.createMemory({
      title: 'Test Memory'
      // Missing date and location
    });
    
    expect(response).toBeNull();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      variant: 'destructive'
    }));
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should successfully create a memory', async () => {
    const mockMemory = {
      id: 'mem123',
      title: 'Test Memory',
      date: '2023-01-01',
      location: 'Test Location',
      privacy: 'private',
      user_id: mockUser.id
    };
    
    // Mock successful insert
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockMemory,
            error: null
          })
        })
      })
    });
    
    const { result } = renderHook(() => useMemoryCreate(mockCallback));
    
    const response = await result.current.createMemory({
      title: 'Test Memory',
      date: '2023-01-01',
      location: 'Test Location'
    });
    
    // Should return the created memory
    expect(response).toEqual(mockMemory);
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Success'
    }));
    expect(mockCallback).toHaveBeenCalled();
  });

  it('should handle Supabase errors', async () => {
    const mockError = new Error('Database error');
    
    // Mock error response
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      })
    });
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useMemoryCreate(mockCallback));
    
    const response = await result.current.createMemory({
      title: 'Test Memory',
      date: '2023-01-01',
      location: 'Test Location'
    });
    
    // Should return null on error
    expect(response).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Error creating memory:', mockError);
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      variant: 'destructive'
    }));
    expect(mockCallback).not.toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
