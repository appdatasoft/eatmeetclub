
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStripeMode } from './useStripeMode';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

describe('useStripeMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with test mode and loading state', () => {
    const { result } = renderHook(() => useStripeMode());
    
    expect(result.current.isStripeTestMode).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stripeCheckError).toBeNull();
  });

  it('should fetch Stripe mode from admin_config', async () => {
    // Mock successful response
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.single as any).mockResolvedValueOnce({
      data: { value: 'live' },
      error: null
    });

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(supabase.from).toHaveBeenCalledWith('admin_config');
    expect(supabase.eq).toHaveBeenCalledWith('key', 'stripe_mode');
    expect(result.current.isStripeTestMode).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripeCheckError).toBeNull();
  });

  it('should handle errors when fetching Stripe mode', async () => {
    // Mock error response
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.single as any).mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to fetch Stripe mode' }
    });

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    await waitForNextUpdate();
    
    expect(result.current.isStripeTestMode).toBe(true); // Defaults to test mode
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripeCheckError).toBe('Failed to fetch Stripe mode');
  });

  it('should retry fetching Stripe mode when handleRetryStripeCheck is called', async () => {
    // First mock an error
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.single as any).mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to fetch Stripe mode' }
    });

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    await waitForNextUpdate();
    
    expect(result.current.stripeCheckError).toBe('Failed to fetch Stripe mode');
    
    // Mock successful response for retry
    (supabase.single as any).mockResolvedValueOnce({
      data: { value: 'live' },
      error: null
    });
    
    // Call retry
    act(() => {
      result.current.handleRetryStripeCheck();
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.isStripeTestMode).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripeCheckError).toBeNull();
  });
});
