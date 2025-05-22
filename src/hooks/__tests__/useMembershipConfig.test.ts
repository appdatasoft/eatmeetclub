
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMembershipConfig } from '@/hooks/membership/useMembershipConfig';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('useMembershipConfig hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default values and loading state', () => {
    // Setup mock to delay response
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue(new Promise(() => {})) // Never resolve to keep loading true
        })
      })
    });

    const { result } = renderHook(() => useMembershipConfig());
    
    // Should start with default value and loading state
    expect(result.current.membershipFee).toBe(25);
    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch membership fee from admin_config table', async () => {
    // Setup mock response from admin_config
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { value: '3000' }, // Value in cents
            error: null
          })
        })
      })
    });

    const { result } = renderHook(() => useMembershipConfig());
    
    // Wait for the async operation to complete
    await vi.runAllTimersAsync();
    
    // Fee should be converted from cents to dollars (3000 / 100 = 30)
    expect(result.current.membershipFee).toBe(30);
    expect(result.current.isLoading).toBe(false);
  });

  it('should fallback to app_config table if admin_config fails', async () => {
    // Setup mock response - admin_config fails, app_config succeeds
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Not found')
          })
        })
      })
    });

    // Mock the fallback to app_config
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { value: '45' }, // Direct value, not in cents
            error: null
          })
        })
      })
    });

    const { result } = renderHook(() => useMembershipConfig());
    
    // Wait for the async operations to complete
    await vi.runAllTimersAsync();
    
    // Fee should be set to the value from app_config
    expect(result.current.membershipFee).toBe(45);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    // Setup mock to throw an error
    const mockError = new Error('Database error');
    
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(mockError)
        })
      })
    });
    
    // Also make the app_config call fail
    (supabase.from as any).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(mockError)
        })
      })
    });

    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const { result } = renderHook(() => useMembershipConfig());
    
    // Wait for the async operations to complete
    await vi.runAllTimersAsync();
    
    // Should maintain default value and set loading to false
    expect(result.current.membershipFee).toBe(25);
    expect(result.current.isLoading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error fetching membership fee:', expect.any(Error));
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
