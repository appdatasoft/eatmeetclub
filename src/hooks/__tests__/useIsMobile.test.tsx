
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile hook', () => {
  const originalInnerWidth = window.innerWidth;
  const mockMatchMedia = vi.fn();
  
  beforeEach(() => {
    window.matchMedia = mockMatchMedia;
  });
  
  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  it('should return true when viewport width is less than the mobile breakpoint', () => {
    window.innerWidth = 700; // Set below mobile breakpoint (768px)
    
    const mockMediaQueryList = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });
  
  it('should return false when viewport width is greater than the mobile breakpoint', () => {
    window.innerWidth = 900; // Set above mobile breakpoint (768px)
    
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });
  
  it('should update value when window size changes', () => {
    window.innerWidth = 900; // Start above mobile breakpoint
    
    let callback: (e: { matches: boolean }) => void;
    const mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn((_, cb) => {
        callback = cb;
      }),
      removeEventListener: vi.fn()
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    
    // Simulate resize
    act(() => {
      callback({ matches: true }); // Simulate resize to mobile width
    });
    
    expect(result.current).toBe(true);
  });
  
  it('should clean up listener on unmount', () => {
    const mockMediaQueryList = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList);
    
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled();
  });
});
