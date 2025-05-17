
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStripeMode } from './useStripeMode';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client properly with a chain-able API
vi.mock('@/integrations/supabase/client', () => {
  const mockSingleFn = vi.fn();
  const mockEqFn = vi.fn(() => ({ single: mockSingleFn }));
  const mockSelectFn = vi.fn(() => ({ eq: mockEqFn }));
  const mockFromFn = vi.fn(() => ({ select: mockSelectFn }));
  
  return {
    supabase: {
      from: mockFromFn
    }
  };
});

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
    const mockSingleFn = vi.fn().mockResolvedValueOnce({
      data: { value: 'live' },
      error: null
    });
    
    const mockEqFn = vi.fn(() => ({ single: mockSingleFn }));
    const mockSelectFn = vi.fn(() => ({ eq: mockEqFn }));
    const mockFromFn = vi.fn(() => ({ select: mockSelectFn }));
    
    // Override the mocked implementation for this test
    vi.mocked(supabase.from).mockImplementation(mockFromFn);

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(mockFromFn).toHaveBeenCalledWith('admin_config');
    expect(mockSelectFn).toHaveBeenCalledWith('value');
    expect(mockEqFn).toHaveBeenCalledWith('key', 'stripe_mode');
    expect(result.current.isStripeTestMode).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripeCheckError).toBeNull();
  });

  it('should handle errors when fetching Stripe mode', async () => {
    // Mock error response
    const mockSingleFn = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to fetch Stripe mode' }
    });
    
    const mockEqFn = vi.fn(() => ({ single: mockSingleFn }));
    const mockSelectFn = vi.fn(() => ({ eq: mockEqFn }));
    const mockFromFn = vi.fn(() => ({ select: mockSelectFn }));
    
    // Override the mocked implementation for this test
    vi.mocked(supabase.from).mockImplementation(mockFromFn);

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    await waitForNextUpdate();
    
    expect(result.current.isStripeTestMode).toBe(true); // Defaults to test mode
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripeCheckError).toBe('Failed to fetch Stripe mode');
  });

  it('should retry fetching Stripe mode when handleRetryStripeCheck is called', async () => {
    // First mock an error
    const mockSingleFnError = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to fetch Stripe mode' }
    });
    
    const mockEqFnError = vi.fn(() => ({ single: mockSingleFnError }));
    const mockSelectFnError = vi.fn(() => ({ eq: mockEqFnError }));
    const mockFromFnError = vi.fn(() => ({ select: mockSelectFnError }));
    
    // Override the mocked implementation for the first part of this test
    vi.mocked(supabase.from).mockImplementation(mockFromFnError);

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    await waitForNextUpdate();
    
    expect(result.current.stripeCheckError).toBe('Failed to fetch Stripe mode');
    
    // Mock successful response for retry
    const mockSingleFnSuccess = vi.fn().mockResolvedValueOnce({
      data: { value: 'live' },
      error: null
    });
    
    const mockEqFnSuccess = vi.fn(() => ({ single: mockSingleFnSuccess }));
    const mockSelectFnSuccess = vi.fn(() => ({ eq: mockEqFnSuccess }));
    const mockFromFnSuccess = vi.fn(() => ({ select: mockSelectFnSuccess }));
    
    // Override the mocked implementation for the retry part
    vi.mocked(supabase.from).mockImplementation(mockFromFnSuccess);
    
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
