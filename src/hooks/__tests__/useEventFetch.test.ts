
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventFetch } from '../useEventFetch';
import { fetchEventDetails, checkEventOwnership } from '../eventDetails/eventDetailsFetcher';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('../eventDetails/eventDetailsFetcher', () => ({
  fetchEventDetails: vi.fn(),
  checkEventOwnership: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('useEventFetch hook', () => {
  const mockEvent = {
    id: 'event-123',
    title: 'Test Event',
    description: 'Test Description',
    user_id: 'user-123',
    restaurant: { id: 'rest-123', name: 'Test Restaurant' }
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should fetch event details and check ownership on mount', async () => {
    (fetchEventDetails as any).mockResolvedValue(mockEvent);
    (checkEventOwnership as any).mockResolvedValue(true);
    
    const { result } = renderHook(() => useEventFetch('event-123'));
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.event).toBe(null);
    
    // Wait for the async operations to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.event).toEqual(mockEvent);
    expect(result.current.isCurrentUserOwner).toBe(true);
    expect(result.current.error).toBe(null);
    
    expect(fetchEventDetails).toHaveBeenCalledWith('event-123');
    expect(checkEventOwnership).toHaveBeenCalledWith('event-123');
  });
  
  it('should handle case when eventId is undefined', async () => {
    const { result } = renderHook(() => useEventFetch(undefined));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.error).toBe('No event ID provided');
    expect(result.current.event).toBe(null);
    expect(fetchEventDetails).not.toHaveBeenCalled();
  });
  
  it('should handle fetch error and show toast for server errors', async () => {
    const serverError = new Error('Server error occurred');
    (fetchEventDetails as any).mockRejectedValue(serverError);
    
    const { result } = renderHook(() => useEventFetch('event-123'));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.error).toBe('Server error occurred');
    expect(result.current.event).toBe(null);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error loading event',
      variant: 'destructive'
    }));
  });
  
  it('should not show toast for invalid ID or not found errors', async () => {
    const notFoundError = new Error('Event not found');
    (fetchEventDetails as any).mockRejectedValue(notFoundError);
    
    const { result } = renderHook(() => useEventFetch('invalid-id'));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.error).toBe('Event not found');
    expect(result.current.event).toBe(null);
    expect(toast).not.toHaveBeenCalled();
  });
  
  it('should allow refreshing event details', async () => {
    // First fetch
    (fetchEventDetails as any).mockResolvedValueOnce(mockEvent);
    (checkEventOwnership as any).mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useEventFetch('event-123'));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.event).toEqual(mockEvent);
    
    // Mock updated data for refresh
    const updatedEvent = { ...mockEvent, title: 'Updated Title' };
    (fetchEventDetails as any).mockResolvedValueOnce(updatedEvent);
    (checkEventOwnership as any).mockResolvedValueOnce(false);
    
    // Reset mocks for the second call
    vi.resetAllMocks();
    
    // Trigger refresh
    result.current.refreshEventDetails();
    
    // Should be loading again
    expect(result.current.isLoading).toBe(true);
    
    // Wait for refresh to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should have updated data
    expect(result.current.event).toEqual(updatedEvent);
    expect(result.current.isCurrentUserOwner).toBe(false);
    expect(fetchEventDetails).toHaveBeenCalledWith('event-123');
    expect(checkEventOwnership).toHaveBeenCalledWith('event-123');
  });
});
