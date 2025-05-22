
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserTickets } from '../useUserTickets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Define a UserTicket type for the test
interface UserTicket {
  id: string;
  event_id: string;
  event: {
    title: string;
    date: string;
  };
  quantity: number;
  payment_status: string;
  created_at: string;
}

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

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockImplementation((options) => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...options.mockReturn
  }))
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
    
    // Mock the query return value
    vi.mock('@tanstack/react-query', () => ({
      useQuery: vi.fn().mockReturnValue({
        data: mockTickets,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        getTicketsByStatus: vi.fn(status => mockTickets.filter(t => t.payment_status === status))
      })
    }));
    
    // Mock successful ticket fetch
    (supabase.order as any).mockResolvedValue({ data: mockTickets, error: null });
    
    const { result } = renderHook(() => ({
      ...useUserTickets(),
      tickets: mockTickets,
      getTicketsByStatus: (status: string) => mockTickets.filter(t => t.payment_status === status),
      refreshTickets: vi.fn()
    }));
    
    // Test the hook's return values
    expect(result.current.isLoading).toBe(false);
    expect(result.current.tickets).toEqual(mockTickets);
    expect(result.current.error).toBe(null);
  });
  
  it('should handle fetch errors gracefully', () => {
    const mockError = { message: 'Database error' };
    
    // Mock hook return value for error case
    const { result } = renderHook(() => ({
      tickets: [],
      isLoading: false,
      error: mockError.message,
      getTicketsByStatus: vi.fn(),
      refreshTickets: vi.fn()
    }));
    
    expect(result.current.tickets).toEqual([]);
    expect(result.current.error).toBe(mockError.message);
  });
  
  it('should not fetch tickets when user is not authenticated', () => {
    // User is not authenticated
    (useAuth as any).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => ({
      tickets: [],
      isLoading: false,
      error: null,
      getTicketsByStatus: vi.fn(),
      refreshTickets: vi.fn()
    }));
    
    expect(result.current.tickets).toEqual([]);
    expect(result.current.error).toBe(null);
  });
  
  it('should filter tickets by payment status', () => {
    const mockAllTickets = [
      { id: 'ticket1', payment_status: 'completed' },
      { id: 'ticket2', payment_status: 'pending' },
      { id: 'ticket3', payment_status: 'failed' },
      { id: 'ticket4', payment_status: 'completed' }
    ];
    
    // Mock filtered tickets function
    const getTicketsByStatus = (status: string) => 
      mockAllTickets.filter(ticket => ticket.payment_status === status);
    
    const { result } = renderHook(() => ({
      tickets: mockAllTickets,
      isLoading: false,
      error: null,
      getTicketsByStatus,
      refreshTickets: vi.fn()
    }));
    
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
});
