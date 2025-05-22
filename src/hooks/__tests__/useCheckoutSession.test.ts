
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCheckoutSession } from '../useCheckoutSession';
import { createCheckoutSession } from '@/lib/createCheckoutSession';

// Mock the createCheckoutSession function
vi.mock('@/lib/createCheckoutSession', () => ({
  createCheckoutSession: vi.fn()
}));

describe('useCheckoutSession hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock window.location.href assignment
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });
  });

  it('should successfully create and redirect to checkout', async () => {
    const mockUrl = 'https://checkout.stripe.com/test-session';
    (createCheckoutSession as any).mockResolvedValue({ url: mockUrl });
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const checkoutPromise = result.current.startCheckout({
      email: 'test@example.com',
      name: 'Test User',
      phone: '123-456-7890',
      address: '123 Test St',
      eventId: 'event-123',
      quantity: 2
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await checkoutPromise;
    
    expect(createCheckoutSession).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      phone: '123-456-7890',
      address: '123 Test St',
      eventId: 'event-123',
      quantity: 2
    });
    
    expect(window.location.href).toBe(mockUrl);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle errors when checkout creation fails', async () => {
    const mockError = 'Failed to create checkout session';
    (createCheckoutSession as any).mockResolvedValue({ error: mockError });
    
    const { result } = renderHook(() => useCheckoutSession());
    
    // Capture console.error calls to avoid polluting test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await expect(
      result.current.startCheckout({ email: 'test@example.com' })
    ).rejects.toThrow(mockError);
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(mockError);
    
    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error occurred');
    (createCheckoutSession as any).mockRejectedValue(networkError);
    
    const { result } = renderHook(() => useCheckoutSession());
    
    // Capture console.error calls 
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await expect(
      result.current.startCheckout({ email: 'test@example.com' })
    ).rejects.toThrow(networkError);
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(networkError.message);
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle missing URL in response', async () => {
    (createCheckoutSession as any).mockResolvedValue({ url: null });
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await expect(
      result.current.startCheckout({ email: 'test@example.com' })
    ).rejects.toThrow('No checkout URL returned');
    
    expect(result.current.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
