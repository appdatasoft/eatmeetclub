
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCheckoutSession } from '@/hooks/membership/useCheckoutSession';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('useCheckoutSession hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully create a checkout session', async () => {
    const mockResponse = {
      data: {
        success: true,
        url: 'https://checkout.stripe.com/test-session'
      },
      error: null
    };
    
    (supabase.functions.invoke as any).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const response = await result.current.createCheckoutSession(
      'test@example.com',
      'Test User',
      '555-1234',
      '123 Test St',
      { createUser: true, sendPasswordEmail: true }
    );
    
    expect(response).toEqual(mockResponse.data);
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'create-membership-checkout',
      {
        body: {
          email: 'test@example.com',
          name: 'Test User',
          phone: '555-1234',
          address: '123 Test St',
          options: { createUser: true, sendPasswordEmail: true }
        }
      }
    );
  });

  it('should handle errors from the function call', async () => {
    const mockErrorResponse = {
      data: null,
      error: {
        message: 'Failed to create checkout'
      }
    };
    
    (supabase.functions.invoke as any).mockResolvedValue(mockErrorResponse);
    
    const { result } = renderHook(() => useCheckoutSession());
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    await expect(
      result.current.createCheckoutSession(
        'test@example.com',
        'Test User',
        '555-1234',
        '123 Test St'
      )
    ).rejects.toThrow('Failed to create checkout');
    
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    (supabase.functions.invoke as any).mockRejectedValue(networkError);
    
    const { result } = renderHook(() => useCheckoutSession());
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    await expect(
      result.current.createCheckoutSession(
        'test@example.com',
        'Test User',
        '555-1234',
        '123 Test St'
      )
    ).rejects.toThrow('Network error');
    
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should use optional parameters correctly', async () => {
    const mockResponse = {
      data: {
        success: true,
        url: 'https://checkout.stripe.com/test-session'
      },
      error: null
    };
    
    (supabase.functions.invoke as any).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const options = {
      createUser: true,
      sendPasswordEmail: true,
      checkExisting: true,
      sendInvoiceEmail: true,
      restaurantId: 'restaurant-123'
    };
    
    await result.current.createCheckoutSession(
      'test@example.com',
      'Test User',
      '555-1234',
      '123 Test St',
      options
    );
    
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'create-membership-checkout',
      {
        body: {
          email: 'test@example.com',
          name: 'Test User',
          phone: '555-1234',
          address: '123 Test St',
          options
        }
      }
    );
  });
});
