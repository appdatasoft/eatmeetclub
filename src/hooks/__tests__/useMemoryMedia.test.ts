
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMemoryMedia } from '../useMemoryMedia';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn()
    }
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

describe('useMemoryMedia hook', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    
    // Mock supabase storage methods
    supabase.storage.from = vi.fn().mockReturnValue({
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn()
    });
  });
  
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMemoryMedia());
    
    expect(result.current.isUploading).toBe(false);
    expect(typeof result.current.uploadMedia).toBe('function');
    expect(typeof result.current.deleteMedia).toBe('function');
  });
  
  it('should successfully upload media file', async () => {
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const mockUserId = 'user-123';
    const mockPublicUrl = 'https://storage.example.com/user-123/test.jpg';
    
    // Mock upload success
    (supabase.storage.from as any).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'memory_media/user-123/test.jpg' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } })
    });
    
    const { result } = renderHook(() => useMemoryMedia());
    
    // Initially not uploading
    expect(result.current.isUploading).toBe(false);
    
    let uploadResult: string | null = null;
    await act(async () => {
      uploadResult = await result.current.uploadMedia(mockFile, mockUserId);
    });
    
    // Should return the public URL
    expect(uploadResult).toBe(mockPublicUrl);
    
    // After completion, not uploading
    expect(result.current.isUploading).toBe(false);
    
    // Should have called storage APIs
    expect(supabase.storage.from).toHaveBeenCalledWith('memory_media');
  });
  
  it('should handle upload errors gracefully', async () => {
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const mockUserId = 'user-123';
    const mockError = { message: 'Upload failed' };
    
    // Mock upload failure
    (supabase.storage.from as any).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: mockError })
    });
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useMemoryMedia());
    
    let uploadResult: string | null = null;
    await act(async () => {
      uploadResult = await result.current.uploadMedia(mockFile, mockUserId);
    });
    
    // Should return null on error
    expect(uploadResult).toBeNull();
    
    // Should show toast error
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Upload Error',
      variant: 'destructive'
    }));
    
    // Should log error
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should successfully delete media file', async () => {
    const mockFilePath = 'https://storage.example.com/memory_media/user-123/image.jpg';
    
    // Mock deletion success
    (supabase.storage.from as any).mockReturnValue({
      remove: vi.fn().mockResolvedValue({ error: null })
    });
    
    const { result } = renderHook(() => useMemoryMedia());
    
    let deleteResult: boolean = false;
    await act(async () => {
      deleteResult = await result.current.deleteMedia(mockFilePath);
    });
    
    // Should return true on success
    expect(deleteResult).toBe(true);
    
    // Should have called storage APIs with correct path
    expect(supabase.storage.from).toHaveBeenCalledWith('memory_media');
  });
  
  it('should handle deletion errors gracefully', async () => {
    const mockFilePath = 'https://storage.example.com/memory_media/user-123/image.jpg';
    const mockError = { message: 'Delete failed' };
    
    // Mock deletion failure
    (supabase.storage.from as any).mockReturnValue({
      remove: vi.fn().mockResolvedValue({ error: mockError })
    });
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useMemoryMedia());
    
    let deleteResult: boolean = true;
    await act(async () => {
      deleteResult = await result.current.deleteMedia(mockFilePath);
    });
    
    // Should return false on error
    expect(deleteResult).toBe(false);
    
    // Should show toast error
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Delete Error',
      variant: 'destructive'
    }));
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should handle invalid file paths gracefully', async () => {
    const invalidPath = 'invalid-path-without-memory-media';
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useMemoryMedia());
    
    let deleteResult: boolean = true;
    await act(async () => {
      deleteResult = await result.current.deleteMedia(invalidPath);
    });
    
    // Should return false on error
    expect(deleteResult).toBe(false);
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
