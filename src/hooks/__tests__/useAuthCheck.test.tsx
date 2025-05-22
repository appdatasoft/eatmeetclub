
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthCheck } from '@/components/restaurants/hooks/useAuthCheck';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('useAuthCheck hook', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    
    // Mock localStorage methods
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('should not redirect if user is authenticated', () => {
    // Mock useAuth to return an authenticated user
    (useAuth as any).mockReturnValue({
      user: { id: 'test-user' },
      isLoading: false
    });
    
    renderHook(() => useAuthCheck());
    
    // Verify navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated and not loading', () => {
    // Set up mocks
    const mockPath = '/current-path';
    Object.defineProperty(window, 'location', {
      value: { pathname: mockPath },
      writable: true
    });
    
    // Mock useAuth to return no user
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false
    });
    
    renderHook(() => useAuthCheck());
    
    // Verify redirect and localStorage operations
    expect(localStorage.setItem).toHaveBeenCalledWith('redirectAfterLogin', mockPath);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { from: mockPath } });
  });

  it('should not redirect while auth state is loading', () => {
    // Mock useAuth to return loading state
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: true
    });
    
    renderHook(() => useAuthCheck());
    
    // Verify no redirect happens during loading
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
