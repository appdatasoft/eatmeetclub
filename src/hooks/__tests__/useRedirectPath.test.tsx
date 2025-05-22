
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRedirectPath } from '../useRedirectPath';
import { useLocation } from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn()
}));

describe('useRedirectPath hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('should prioritize redirect search param if available', () => {
    (useLocation as any).mockReturnValue({
      search: '?redirect=/redirect-page',
      state: { from: '/state-path' }
    });
    localStorage.setItem('redirectAfterLogin', '/stored-path');
    
    const { result } = renderHook(() => useRedirectPath());
    const redirectPath = result.current();
    
    expect(redirectPath).toBe('/redirect-page');
    expect(localStorage.getItem('redirectAfterLogin')).toBeNull(); // Should be cleared
  });

  it('should use location state if no redirect param', () => {
    (useLocation as any).mockReturnValue({
      search: '',
      state: { from: '/state-path' }
    });
    localStorage.setItem('redirectAfterLogin', '/stored-path');
    
    const { result } = renderHook(() => useRedirectPath());
    const redirectPath = result.current();
    
    expect(redirectPath).toBe('/state-path');
    expect(localStorage.getItem('redirectAfterLogin')).toBeNull(); // Should be cleared
  });

  it('should use localStorage path if no redirect param or state', () => {
    (useLocation as any).mockReturnValue({
      search: '',
      state: null
    });
    localStorage.setItem('redirectAfterLogin', '/stored-path');
    
    const { result } = renderHook(() => useRedirectPath());
    const redirectPath = result.current();
    
    expect(redirectPath).toBe('/stored-path');
    expect(localStorage.getItem('redirectAfterLogin')).toBeNull(); // Should be cleared
  });

  it('should return default path if no redirect sources available', () => {
    (useLocation as any).mockReturnValue({
      search: '',
      state: null
    });
    
    const { result } = renderHook(() => useRedirectPath());
    const redirectPath = result.current();
    
    expect(redirectPath).toBe('/dashboard');
  });
});
