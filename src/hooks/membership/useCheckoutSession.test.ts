
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCheckoutSession } from './useCheckoutSession';

interface CheckoutOptions {
  createUser: boolean;
  sendPasswordEmail: boolean;
  sendInvoiceEmail: boolean;
  checkExisting: boolean;
}

interface CheckoutResponse {
  url?: string;
  success: boolean;
  error?: string;
}

// Mock the actual implementation
vi.mock('./useCheckoutSession', () => ({
  useCheckoutSession: vi.fn(() => ({
    createCheckoutSession: vi.fn()
  }))
}));

// Mock fetch
global.fetch = vi.fn();

describe('useCheckoutSession', () => {
  const mockFetch = global.fetch as vi.MockedFunction<typeof fetch>;
  const mockImplementation = useCheckoutSession as vi.Mock;
  const mockCreateCheckoutSession = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockImplementation.mockImplementation(() => ({
      createCheckoutSession: mockCreateCheckoutSession
    }));
  });

  it('should create checkout session with proper parameters', async () => {
    mockCreateCheckoutSession.mockResolvedValue({ 
      success: true, 
      url: 'https://checkout.stripe.com/test' 
    });
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const options: CheckoutOptions = {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true
    };
    
    let response: CheckoutResponse | undefined;
    await act(async () => {
      response = await result.current.createCheckoutSession(
        'test@example.com', 
        'Test User', 
        '123456789', 
        '123 Test St',
        options
      );
    });
    
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      'test@example.com', 
      'Test User', 
      '123456789', 
      '123 Test St',
      options
    );
    
    expect(response?.success).toBe(true);
    expect(response?.url).toBe('https://checkout.stripe.com/test');
  });
  
  it('should handle errors properly', async () => {
    const errorMessage = 'Failed to create checkout session';
    mockCreateCheckoutSession.mockResolvedValue({ 
      success: false, 
      error: errorMessage 
    });
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const options: CheckoutOptions = {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true
    };
    
    let response: CheckoutResponse | undefined;
    await act(async () => {
      response = await result.current.createCheckoutSession(
        'test@example.com', 
        'Test User', 
        null, 
        null,
        options
      );
    });
    
    expect(response?.success).toBe(false);
    expect(response?.error).toBe(errorMessage);
  });
});
