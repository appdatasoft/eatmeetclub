
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventAccess } from '../useEventAccess';
import { useAuth } from '../useAuth';
import { EventDetails } from '@/types/event';

// Mock useAuth hook
vi.mock('../useAuth', () => ({
  useAuth: vi.fn()
}));

describe('useEventAccess hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should grant edit access when user is the event owner', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockEvent = { user_id: 'user-123', title: 'Test Event' } as EventDetails;
    
    (useAuth as any).mockReturnValue({ user: mockUser, isAdmin: false });
    
    const { result } = renderHook(() => useEventAccess(mockEvent));
    
    expect(result.current.canEditEvent).toBe(true);
  });

  it('should grant edit access when user is admin', () => {
    const mockUser = { id: 'user-456', email: 'admin@example.com' };
    const mockEvent = { user_id: 'user-123', title: 'Test Event' } as EventDetails;
    
    (useAuth as any).mockReturnValue({ user: mockUser, isAdmin: true });
    
    const { result } = renderHook(() => useEventAccess(mockEvent));
    
    expect(result.current.canEditEvent).toBe(true);
  });

  it('should deny edit access when user is not owner or admin', () => {
    const mockUser = { id: 'user-456', email: 'user@example.com' };
    const mockEvent = { user_id: 'user-123', title: 'Test Event' } as EventDetails;
    
    (useAuth as any).mockReturnValue({ user: mockUser, isAdmin: false });
    
    const { result } = renderHook(() => useEventAccess(mockEvent));
    
    expect(result.current.canEditEvent).toBe(false);
  });

  it('should deny edit access when user is not authenticated', () => {
    const mockEvent = { user_id: 'user-123', title: 'Test Event' } as EventDetails;
    
    (useAuth as any).mockReturnValue({ user: null, isAdmin: false });
    
    const { result } = renderHook(() => useEventAccess(mockEvent));
    
    expect(result.current.canEditEvent).toBe(false);
  });

  it('should deny edit access when event is null', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    
    (useAuth as any).mockReturnValue({ user: mockUser, isAdmin: true });
    
    const { result } = renderHook(() => useEventAccess(null));
    
    expect(result.current.canEditEvent).toBe(false);
  });
});
