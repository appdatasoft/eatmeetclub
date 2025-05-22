
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventDetails } from '../useEventDetails';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEventPaymentHandler } from '@/hooks/event-payment/useEventPaymentHandler';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/event-payment/useEventPaymentHandler', () => ({
  useEventPaymentHandler: vi.fn()
}));

describe('useEventDetails hook', () => {
  const mockUser = { id: 'user-123' };
  const mockHandleBuyTickets = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementations
    (useAuth as any).mockReturnValue({ user: mockUser });
    (useEventPaymentHandler as any).mockReturnValue({
      isPaymentProcessing: false,
      handleBuyTickets: mockHandleBuyTickets
    });
  });
  
  it('should fetch event details on mount', async () => {
    const mockEventData = {
      id: 'event-123',
      title: 'Test Event',
      description: 'Test description',
      date: '2025-07-15',
      time: '18:00',
      price: 25,
      capacity: 100,
      user_id: 'user-456',
      published: true,
      restaurants: {
        id: 'rest-123',
        name: 'Test Restaurant',
        address: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipcode: '12345',
        description: 'A test restaurant'
      },
      cover_image: 'https://example.com/image.jpg',
      tickets_sold: 10
    };
    
    // Mock Supabase response
    (supabase.single as any).mockResolvedValue({ data: mockEventData, error: null });
    
    const { result } = renderHook(() => useEventDetails('event-123'));
    
    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should have stored the event data
    expect(result.current.event).toBeDefined();
    expect(result.current.event?.id).toBe('event-123');
    expect(result.current.event?.title).toBe('Test Event');
    
    // Restaurant data should be properly formatted
    expect(result.current.event?.restaurant).toBeDefined();
    expect(result.current.event?.restaurant.name).toBe('Test Restaurant');
    
    // Should determine if current user is owner (not in this case)
    expect(result.current.isCurrentUserOwner).toBe(false);
  });
  
  it('should handle missing eventId', async () => {
    const { result } = renderHook(() => useEventDetails(undefined));
    
    // Should not attempt to load without an ID
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result.current.event).toBeNull();
  });
  
  it('should handle database errors', async () => {
    const mockError = { message: 'Database error' };
    (supabase.single as any).mockResolvedValue({ data: null, error: mockError });
    
    const { result } = renderHook(() => useEventDetails('invalid-id'));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.error).toBe(mockError.message);
    expect(result.current.event).toBeNull();
  });
  
  it('should identify current user as owner', async () => {
    // Event owned by the current mock user
    const mockEventData = {
      id: 'event-123',
      user_id: 'user-123', // Same as mockUser.id
      restaurants: {}
    };
    
    (supabase.single as any).mockResolvedValue({ data: mockEventData, error: null });
    
    const { result } = renderHook(() => useEventDetails('event-123'));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.isCurrentUserOwner).toBe(true);
  });
  
  it('should handle missing restaurant data', async () => {
    // Event with no restaurant data
    const mockEventData = {
      id: 'event-123',
      user_id: 'user-456',
      restaurants: null
    };
    
    (supabase.single as any).mockResolvedValue({ data: mockEventData, error: null });
    
    const { result } = renderHook(() => useEventDetails('event-123'));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should create default restaurant data
    expect(result.current.event?.restaurant).toBeDefined();
    expect(result.current.event?.restaurant.name).toBe('Unknown Restaurant');
  });
  
  it('should allow refreshing event details', async () => {
    const initialEventData = {
      id: 'event-123',
      title: 'Initial Title',
      restaurants: {}
    };
    
    const updatedEventData = {
      id: 'event-123',
      title: 'Updated Title',
      restaurants: {}
    };
    
    // First call returns initial data
    (supabase.single as any).mockResolvedValueOnce({ data: initialEventData, error: null });
    
    const { result } = renderHook(() => useEventDetails('event-123'));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.event?.title).toBe('Initial Title');
    
    // Reset mock for next call
    (supabase.from as any).mockClear();
    (supabase.select as any).mockClear();
    (supabase.eq as any).mockClear();
    (supabase.single as any).mockResolvedValueOnce({ data: updatedEventData, error: null });
    
    // Trigger refresh
    act(() => {
      result.current.refreshEventDetails();
    });
    
    // Should be loading again
    expect(result.current.isLoading).toBe(true);
    
    // Wait for refresh to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should have updated data
    expect(result.current.event?.title).toBe('Updated Title');
  });
});
