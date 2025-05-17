import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCheckoutSession } from './useCheckoutSession';

// Mock fetch
global.fetch = vi.fn();

describe('useCheckoutSession', () => {
  const mockFetch = global.fetch as vi.MockedFunction<typeof fetch>;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' })
      }), 100))
    );
    
    const { result } = renderHook(() => useCheckoutSession({ priceId: 'price_123', quantity: 1 }));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.checkoutUrl).toBe(null);
    expect(result.current.error).toBe(null);
  });
  
  it('should fetch checkout URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' })
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useCheckoutSession({ priceId: 'price_123', quantity: 1 }));
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe('https://checkout.stripe.com/test');
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  
  it('should handle fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result, waitForNextUpdate } = renderHook(() => useCheckoutSession({ priceId: 'price_123', quantity: 1 }));
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe(null);
    expect(result.current.error).toBe('Network error');
  });
  
  it('should handle API error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useCheckoutSession({ priceId: 'price_123', quantity: 1 }));
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe(null);
    expect(result.current.error).toContain('Failed to create checkout session');
  });
  
  it('should retry on error if retryCount is less than maxRetries', async () => {
    // First call fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result, waitForNextUpdate } = renderHook(() => useCheckoutSession({ priceId: 'price_123', quantity: 1 }));
    
    await waitForNextUpdate();
    
    // Verify the first error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe(null);
    expect(result.current.error).toBe('Network error');
    
    // Setup second attempt to succeed
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://checkout.stripe.com/retry_success' })
    });
    
    // Trigger retry
    act(() => {
      result.current.retry();
    });
    
    // Should be loading again
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    // Should now have the URL
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe('https://checkout.stripe.com/retry_success');
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
