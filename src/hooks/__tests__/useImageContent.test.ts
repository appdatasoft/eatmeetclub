
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useImageContent } from '../useImageContent';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis()
  }
}));

describe('useImageContent hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should return default images initially and while loading', () => {
    const defaultImages = { heroImage: '/path/to/default.jpg' };
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: () => new Promise(() => {}) // Never resolves to simulate loading
          })
        })
      })
    }));
    
    const { result } = renderHook(() => useImageContent('home', defaultImages));
    
    expect(result.current.images).toEqual(defaultImages);
    expect(result.current.isLoading).toBe(true);
  });
  
  it('should fetch and merge images from database', async () => {
    const defaultImages = {
      heroImage: '/path/to/default.jpg',
      logoImage: '/path/to/logo.png'
    };
    
    const dbImages = [
      { element_id: 'heroImage', content: '/path/to/fetched-hero.jpg' }
    ];
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: () => Promise.resolve({ data: dbImages, error: null })
          })
        })
      })
    }));
    
    const { result } = renderHook(() => useImageContent('home', defaultImages));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Only heroImage should be updated, logoImage should remain default
    expect(result.current.images).toEqual({
      heroImage: '/path/to/fetched-hero.jpg',
      logoImage: '/path/to/logo.png'
    });
    expect(result.current.error).toBe(null);
  });
  
  it('should handle database errors', async () => {
    const defaultImages = { heroImage: '/path/to/default.jpg' };
    const mockError = new Error('Database error');
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: () => Promise.resolve({ data: null, error: mockError })
          })
        })
      })
    }));
    
    const { result } = renderHook(() => useImageContent('about', defaultImages));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should retain default images on error
    expect(result.current.images).toEqual(defaultImages);
    expect(result.current.error).toBe(mockError.message);
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should not fetch if no default images are provided', async () => {
    const { result } = renderHook(() => useImageContent('contact', {}));
    
    // Should be done loading immediately since there's nothing to fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.images).toEqual({});
    expect(supabase.from).not.toHaveBeenCalled();
  });
  
  it('should allow updating images through setImages', async () => {
    const defaultImages = { heroImage: '/path/to/default.jpg' };
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    }));
    
    const { result } = renderHook(() => useImageContent('home', defaultImages));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Update images manually
    const newImages = { heroImage: '/path/to/new.jpg' };
    result.current.setImages(newImages);
    
    expect(result.current.images).toEqual(newImages);
  });
});
