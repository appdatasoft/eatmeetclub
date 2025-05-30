
import { renderHook, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import { usePaymentConfig } from '../usePaymentConfig';

// Create a simple mock for supabase client
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the toast hook
const mockToast = { toast: vi.fn() };
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => mockToast
}));

describe('usePaymentConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should fetch payment configuration correctly', async () => {
    // Mock a successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        data: { 
          membershipFee: 25,
          currency: 'USD',
          taxRate: 0.07
        } 
      })
    });

    const { result } = renderHook(() => usePaymentConfig());
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Use act to wait for asynchronous update
    await act(async () => {
      // Wait for async effect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // After loading, we should have our config
    expect(result.current.isLoading).toBe(false);
    expect(result.current.membershipFee).toBe(25);
    expect(result.current.currency).toBe('USD');
    expect(result.current.taxRate).toBe(0.07);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle errors properly', async () => {
    // Mock an error response
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => usePaymentConfig());
    
    // Wait for error state using act
    await act(async () => {
      // Wait for async effect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Should show error state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Error loading payment configuration',
      description: expect.any(String),
      variant: 'destructive'
    });
  });
});
