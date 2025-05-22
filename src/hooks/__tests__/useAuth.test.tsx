
import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';
import { AuthContext } from '@/contexts/AuthContext';
import { Session, User } from '@supabase/supabase-js';

describe('useAuth hook', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
    confirmed_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T00:00:00.000Z',
    role: 'authenticated',
    updated_at: '2023-01-01T00:00:00.000Z'
  } as User;

  const mockAuthContext = {
    user: mockUser,
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser
    } as Session,
    isLoading: false,
    isAdmin: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    handleLogout: vi.fn(),
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
