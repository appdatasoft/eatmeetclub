
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStripePublishableKey } from '../useStripePublishableKey';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch API
global.fetch = vi.fn();

describe('useStripePublishableKey Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  it('should return loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ key: 'test_publishable_key' })
      }), 100))
    );
    
    const { result } = renderHook(() => useStripePublishableKey());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stripePublishableKey).toBe(null);
    expect(result.current.error).toBe(null);
  });
  
  it('should fetch and return Stripe key', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ key: 'test_publishable_key' })
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useStripePublishableKey());
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripePublishableKey).toBe('test_publishable_key');
    expect(result.current.error).toBe(null);
    expect(localStorage.getItem('stripe_publishable_key')).toBe('test_publishable_key');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  
  it('should use cached key if available', async () => {
    // Set cached key
    localStorage.setItem('stripe_publishable_key', 'cached_publishable_key');
    
    const { result } = renderHook(() => useStripePublishableKey());
    
    // Should immediately return cached key without loading state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripePublishableKey).toBe('cached_publishable_key');
    expect(result.current.error).toBe(null);
    expect(fetch).not.toHaveBeenCalled();
  });
  
  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { result, waitForNextUpdate } = renderHook(() => useStripePublishableKey());
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripePublishableKey).toBe(null);
    expect(result.current.error).toBe('Network error');
    expect(localStorage.getItem('stripe_publishable_key')).toBe(null);
  });
  
  it('should handle API error response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useStripePublishableKey());
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripePublishableKey).toBe(null);
    expect(result.current.error).toContain('Failed to fetch Stripe key');
  });
  
  it('should retry on error if retryCount is less than maxRetries', async () => {
    // First call fails
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { result, waitForNextUpdate } = renderHook(() => useStripePublishableKey());
    
    await waitForNextUpdate();
    
    // Verify the first error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripePublishableKey).toBe(null);
    expect(result.current.error).toBe('Network error');
    
    // Setup second attempt to succeed
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ key: 'retry_success_key' })
    });
    
    // Trigger retry
    act(() => {
      result.current.retry();
    });
    
    // Should be loading again
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    // Should now have the key
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stripePublishableKey).toBe('retry_success_key');
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
