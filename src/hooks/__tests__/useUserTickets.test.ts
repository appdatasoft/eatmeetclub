
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserTickets } from '../useUserTickets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis()
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

describe('useUserTickets hook', () => {
  const mockUser = { id: 'user-123' };
  
  beforeEach(() => {
    vi.resetAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
  });
  
  it('should fetch user tickets when user is authenticated', async () => {
    const mockTickets = [
      {
        id: 'ticket1',
        event_id: 'event1',
        event: { title: 'Summer BBQ', date: '2025-07-04' },
        quantity: 2,
        created_at: '2025-05-01T12:00:00Z',
        payment_status: 'completed'
      },
      {
        id: 'ticket2',
        event_id: 'event2',
        event: { title: 'Wine Tasting', date: '2025-08-15' },
        quantity: 1,
        created_at: '2025-05-02T12:00:00Z',
        payment_status: 'completed'
      }
    ];
    
    // Mock successful ticket fetch
    (supabase.order as any).mockResolvedValue({ data: mockTickets, error: null });
    
    const { result } = renderHook(() => useUserTickets());
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.tickets).toEqual([]);
    
    // Wait for fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.tickets).toEqual(mockTickets);
    expect(result.current.error).toBe(null);
    expect(supabase.from).toHaveBeenCalledWith('tickets');
    expect(supabase.select).toHaveBeenCalledWith('*, event:events(*)');
    expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUser.id);
  });
  
  it('should handle fetch errors gracefully', async () => {
    const mockError = { message: 'Database error' };
    
    // Mock fetch error
    (supabase.order as any).mockResolvedValue({ data: null, error: mockError });
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useUserTickets());
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.tickets).toEqual([]);
    expect(result.current.error).toBe(mockError.message);
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should not fetch tickets when user is not authenticated', async () => {
    // User is not authenticated
    (useAuth as any).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => useUserTickets());
    
    // Should be done loading immediately since no fetch is attempted
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.tickets).toEqual([]);
    expect(result.current.error).toBe(null);
    
    // Should not attempt to fetch from database
    expect(supabase.from).not.toHaveBeenCalled();
  });
  
  it('should filter tickets by payment status', async () => {
    const mockAllTickets = [
      {
        id: 'ticket1',
        payment_status: 'completed'
      },
      {
        id: 'ticket2',
        payment_status: 'pending'
      },
      {
        id: 'ticket3',
        payment_status: 'failed'
      },
      {
        id: 'ticket4',
        payment_status: 'completed'
      }
    ];
    
    // Mock successful ticket fetch
    (supabase.order as any).mockResolvedValue({ data: mockAllTickets, error: null });
    
    const { result } = renderHook(() => useUserTickets());
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // All tickets should be returned
    expect(result.current.tickets).toHaveLength(4);
    
    // Get only completed tickets
    const completedTickets = result.current.getTicketsByStatus('completed');
    expect(completedTickets).toHaveLength(2);
    expect(completedTickets[0].id).toBe('ticket1');
    expect(completedTickets[1].id).toBe('ticket4');
    
    // Get pending tickets
    const pendingTickets = result.current.getTicketsByStatus('pending');
    expect(pendingTickets).toHaveLength(1);
    expect(pendingTickets[0].id).toBe('ticket2');
  });
  
  it('should refresh tickets when requested', async () => {
    // Initial fetch
    const initialTickets = [{ id: 'ticket1' }];
    (supabase.order as any).mockResolvedValueOnce({ data: initialTickets, error: null });
    
    const { result } = renderHook(() => useUserTickets());
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tickets).toEqual(initialTickets);
    
    // Reset mocks for second fetch
    vi.resetAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    
    // Mock updated data for refresh
    const updatedTickets = [{ id: 'ticket1' }, { id: 'ticket2' }];
    (supabase.order as any).mockResolvedValueOnce({ data: updatedTickets, error: null });
    
    // Trigger refresh
    await waitFor(() => result.current.refreshTickets());
    
    // Should be loading during refresh
    expect(result.current.isLoading).toBe(true);
    
    // Wait for refresh to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should have updated tickets
    expect(result.current.tickets).toEqual(updatedTickets);
    
    // Should have called Supabase again
    expect(supabase.from).toHaveBeenCalledWith('tickets');
  });
});
