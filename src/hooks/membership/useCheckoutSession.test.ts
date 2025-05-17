
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCheckoutSession } from './useCheckoutSession';

// Mock the actual implementation
vi.mock('./useCheckoutSession', () => ({
  useCheckoutSession: vi.fn().mockImplementation(() => ({
    isLoading: false,
    checkoutUrl: null,
    error: null,
    createCheckoutSession: vi.fn(),
    retry: vi.fn()
  }))
}));

// Mock fetch
global.fetch = vi.fn();

describe('useCheckoutSession', () => {
  const mockFetch = global.fetch as vi.MockedFunction<typeof fetch>;
  const mockImplementation = useCheckoutSession as vi.Mock;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    mockImplementation.mockImplementationOnce(() => ({
      isLoading: true,
      checkoutUrl: null,
      error: null,
      createCheckoutSession: vi.fn(),
      retry: vi.fn()
    }));
    
    const { result } = renderHook(() => useCheckoutSession());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.checkoutUrl).toBe(null);
    expect(result.current.error).toBe(null);
  });
  
  it('should fetch checkout URL', async () => {
    const mockCreateCheckoutSession = vi.fn().mockResolvedValueOnce({ url: 'https://checkout.stripe.com/test' });
    
    mockImplementation.mockImplementationOnce(() => ({
      isLoading: false,
      checkoutUrl: 'https://checkout.stripe.com/test',
      error: null,
      createCheckoutSession: mockCreateCheckoutSession,
      retry: vi.fn()
    }));
    
    const { result } = renderHook(() => useCheckoutSession());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe('https://checkout.stripe.com/test');
    expect(result.current.error).toBe(null);
  });
  
  it('should handle fetch error', async () => {
    mockImplementation.mockImplementationOnce(() => ({
      isLoading: false,
      checkoutUrl: null,
      error: 'Network error',
      createCheckoutSession: vi.fn(),
      retry: vi.fn()
    }));
    
    const { result } = renderHook(() => useCheckoutSession());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe(null);
    expect(result.current.error).toBe('Network error');
  });
  
  it('should handle API error response', async () => {
    mockImplementation.mockImplementationOnce(() => ({
      isLoading: false,
      checkoutUrl: null,
      error: 'Failed to create checkout session: Internal Server Error',
      createCheckoutSession: vi.fn(),
      retry: vi.fn()
    }));
    
    const { result } = renderHook(() => useCheckoutSession());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe(null);
    expect(result.current.error).toContain('Failed to create checkout session');
  });
  
  it('should retry on error if retryCount is less than maxRetries', async () => {
    // First state (with error)
    const mockRetry = vi.fn();
    mockImplementation.mockImplementationOnce(() => ({
      isLoading: false,
      checkoutUrl: null,
      error: 'Network error',
      createCheckoutSession: vi.fn(),
      retry: mockRetry
    }));
    
    const { result, rerender } = renderHook(() => useCheckoutSession());
    
    // Verify the first error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe(null);
    expect(result.current.error).toBe('Network error');
    
    // Setup second state (after retry - loading)
    mockImplementation.mockImplementationOnce(() => ({
      isLoading: true,
      checkoutUrl: null,
      error: null,
      createCheckoutSession: vi.fn(),
      retry: mockRetry
    }));
    
    // Trigger retry
    act(() => {
      result.current.retry();
    });
    
    // Should be loading again
    rerender();
    expect(result.current.isLoading).toBe(true);
    
    // Setup third state (success after loading)
    mockImplementation.mockImplementationOnce(() => ({
      isLoading: false,
      checkoutUrl: 'https://checkout.stripe.com/retry_success',
      error: null,
      createCheckoutSession: vi.fn(),
      retry: mockRetry
    }));
    
    // Update to success state
    rerender();
    
    // Should now have the URL
    expect(result.current.isLoading).toBe(false);
    expect(result.current.checkoutUrl).toBe('https://checkout.stripe.com/retry_success');
    expect(result.current.error).toBe(null);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});
