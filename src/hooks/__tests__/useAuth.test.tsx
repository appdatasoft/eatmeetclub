
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';
import { AuthContext } from '@/contexts/AuthContext';

describe('useAuth hook', () => {
  const mockAuthContext = {
    user: { id: 'test-user-id', email: 'test@example.com' },
    isLoading: false,
    isAdmin: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  };

  it('should return auth context values when used within provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toEqual(mockAuthContext);
  });

  it('should throw error when used outside of AuthProvider', () => {
    // Silence the expected error for cleaner test output
    const consoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    // Restore console.error
    console.error = consoleError;
  });
});
