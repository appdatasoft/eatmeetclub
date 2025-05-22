
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMembershipStatus } from '../useMembershipStatus';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

// Mock dependencies
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis()
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

describe('useMembershipStatus hook', () => {
  const mockUser = { id: 'user-123' };
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementation
    (useAuth as any).mockReturnValue({ user: mockUser });
  });
  
  it('should return inactive state when user is not authenticated', async () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    const { result } = renderHook(() => useMembershipStatus());
    
    // Should be done loading immediately since there's no user
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.membership).toBe(null);
    expect(result.current.expiresAt).toBe(null);
    expect(result.current.restaurantMemberships).toEqual([]);
    
    // Should not query the database
    expect(supabase.from).not.toHaveBeenCalled();
  });
  
  it('should detect active restaurant memberships', async () => {
    const mockMemberships = [
      {
        id: 'membership-1',
        restaurant_id: 'restaurant-1',
        status: 'active',
        renewal_at: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        restaurant: { id: 'restaurant-1', name: 'Test Restaurant' },
        product: { name: 'Monthly Membership', description: 'Monthly access' }
      }
    ];
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: mockMemberships, error: null })
        })
      })
    }));
    
    const { result } = renderHook(() => useMembershipStatus());
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.membership).toEqual(mockMemberships[0]);
    expect(result.current.expiresAt).toEqual(mockMemberships[0].renewal_at);
    expect(result.current.restaurantMemberships).toEqual(mockMemberships);
    
    // Test hasRestaurantMembership helper
    expect(result.current.hasRestaurantMembership('restaurant-1')).toBe(true);
    expect(result.current.hasRestaurantMembership('restaurant-2')).toBe(false);
  });
  
  it('should handle database errors', async () => {
    const mockError = new Error('Database error');
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => Promise.reject(mockError)
        })
      })
    }));
    
    const { result } = renderHook(() => useMembershipStatus());
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.membership).toBe(null);
    expect(result.current.expiresAt).toBe(null);
    expect(result.current.restaurantMemberships).toEqual([]);
    
    // Should have logged error
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should check specific restaurant membership', async () => {
    const mockIsActive = true;
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { status: 'active' }, error: null })
            })
          })
        })
      })
    }));
    
    const { result } = renderHook(() => useMembershipStatus());
    
    // Test direct check for restaurant membership
    let isActive;
    await act(async () => {
      isActive = await result.current.refreshMembership('restaurant-1');
    });
    
    expect(isActive).toBe(mockIsActive);
    expect(supabase.from).toHaveBeenCalled();
  });
});
