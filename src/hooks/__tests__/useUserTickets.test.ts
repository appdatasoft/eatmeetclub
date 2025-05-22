
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserTickets } from '../useUserTickets';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis()
  }
}));

describe('useUserTickets hook', () => {
  let queryClient: QueryClient;
  
  // Create a wrapper with QueryClientProvider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0
        }
      }
    });
  });
  
  it('should fetch and format user tickets successfully', async () => {
    const mockTicketsResponse = [
      {
        id: 'ticket-1',
        event_id: 'event-1',
        quantity: 2,
        price: 50,
        purchase_date: '2023-05-15',
        payment_status: 'completed',
        events: {
          title: 'Concert Night',
          date: '2023-06-15',
          restaurants: {
            name: 'Jazz Club'
          }
        }
      },
      {
        id: 'ticket-2',
        event_id: 'event-2',
        quantity: 1,
        price: 25,
        purchase_date: '2023-05-20',
        payment_status: 'completed',
        events: {
          title: 'Comedy Show',
          date: '2023-07-10',
          restaurants: null
        }
      }
    ];
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: mockTicketsResponse, error: null })
        })
      })
    }));
    
    const userId = 'user-123';
    const { result } = renderHook(() => useUserTickets(userId), { wrapper });
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify formatted data
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toEqual({
      id: 'ticket-1',
      event_id: 'event-1',
      event_title: 'Concert Night',
      event_date: expect.any(String), // Date format may vary by locale
      restaurant_name: 'Jazz Club',
      quantity: 2,
      price: 50,
      purchase_date: expect.any(String)
    });
    
    expect(result.current.data?.[1].restaurant_name).toBe('Unknown venue');
  });
  
  it('should handle errors when fetching tickets', async () => {
    const mockError = new Error('Database error');
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: null, error: mockError })
        })
      })
    }));
    
    // Capture console.error to avoid polluting test output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const userId = 'user-123';
    const { result } = renderHook(() => useUserTickets(userId), { wrapper });
    
    // Wait for the query to resolve (to error state)
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
  
  it('should not fetch tickets if userId is not provided', async () => {
    const { result } = renderHook(() => useUserTickets(''), { wrapper });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetched).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
  });
  
  it('should refetch tickets when query key changes', async () => {
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: [], error: null })
        })
      })
    }));
    
    const userId1 = 'user-123';
    const { result, rerender } = renderHook(
      (props) => useUserTickets(props.userId),
      { wrapper, initialProps: { userId: userId1 } }
    );
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Change userId and rerender
    const userId2 = 'user-456';
    rerender({ userId: userId2 });
    
    // Should trigger loading again
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Supabase should have been called with the new userId
    expect(supabase.from).toHaveBeenCalledTimes(2);
  });
});
