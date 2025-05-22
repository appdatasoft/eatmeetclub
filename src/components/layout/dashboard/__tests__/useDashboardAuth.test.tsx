
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDashboardAuth } from '../useDashboardAuth';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn()
}));

describe('useDashboardAuth hook', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockToast = { toast: vi.fn() };
  const mockLocation = { pathname: '/dashboard/events' };
  
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isAdmin: false,
      isLoading: false
    });
    
    (useToast as any).mockReturnValue(mockToast);
    (useLocation as any).mockReturnValue(mockLocation);
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('should return user, isAdmin, and isLoading from useAuth', () => {
    const { result } = renderHook(() => useDashboardAuth());
    
    expect(result.current.user).toBe(mockUser);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(true); // Initial state is true
    expect(result.current.authCheckTimeout).toBe(false);
  });
  
  it('should set authCheckTimeout after 5 seconds if still loading', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: true
    });
    
    const { result } = renderHook(() => useDashboardAuth());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.authCheckTimeout).toBe(false);
    
    // Fast-forward time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Now authCheckTimeout should be true and isLoading should be false
    expect(result.current.authCheckTimeout).toBe(true);
    expect(result.current.isLoading).toBe(false); // isLoading is false when timeout occurs
  });
  
  it('should clear the timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { unmount } = renderHook(() => useDashboardAuth());
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  it('should provide the current path from useLocation', () => {
    const { result } = renderHook(() => useDashboardAuth());
    
    expect(result.current.currentPath).toBe('/dashboard/events');
  });
  
  it('should provide a showToast function that calls toast', () => {
    const { result } = renderHook(() => useDashboardAuth());
    
    result.current.showToast('Test Title', 'Test Description');
    
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Test Title',
      description: 'Test Description'
    });
  });
  
  it('should allow setting redirectAttempted state', () => {
    const { result } = renderHook(() => useDashboardAuth());
    
    expect(result.current.redirectAttempted).toBe(false);
    
    act(() => {
      result.current.setRedirectAttempted(true);
    });
    
    expect(result.current.redirectAttempted).toBe(true);
  });
});
