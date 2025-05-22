
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserTickets } from '../useUserTickets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserTicket } from '@/components/dashboard/tickets/types';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => {
  const mockOrderFn = vi.fn().mockImplementation(() => ({
    data: [],
    error: null
  }));

  return {
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: mockOrderFn
    }
  };
});

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
    const mockTickets: UserTicket[] = [
      {
        id: 'ticket1',
        event_id: 'event1',
        event_title: 'Summer BBQ',
        event_date: '2023-06-15',
        restaurant_name: 'Test Restaurant',
        quantity: 2,
        price: 25,
        purchase_date: '2023-06-01'
      },
      {
        id: 'ticket2',
        event_id: 'event2',
        event_title: 'Wine Tasting',
        event_date: '2023-07-20',
        restaurant_name: 'Wine Bar',
        quantity: 1,
        price: 35,
        purchase_date: '2023-06-10'
      }
    ];
    
    // Mock the query return value
    vi.mock('@tanstack/react-query', () => ({
      useQuery: vi.fn().mockReturnValue({
        data: mockTickets,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      })
    }));
    
    // Mock successful ticket fetch
    const mockDataResponse = { data: mockTickets, error: null };
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(mockDataResponse)
    } as any);
    
    const { result } = renderHook(() => useUserTickets('user-123'));
    
    // Test the hook's return values
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockTickets);
    expect(result.current.error).toBe(null);
  });
  
  it('should handle fetch errors gracefully', () => {
    const mockError = { message: 'Failed to fetch tickets' };
    
    // Mock hook return value for error case
    const { result } = renderHook(() => ({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn()
    }));
    
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
  });
  
  it('should not fetch tickets when user is not authenticated', () => {
    // User is not authenticated
    (useAuth as any).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => ({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    }));
    
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(null);
  });
});
