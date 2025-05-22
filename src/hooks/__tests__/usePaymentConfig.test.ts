
import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePaymentConfig } from '../usePaymentConfig';
import { supabase } from '@/lib/supabaseClient';

// Mock the supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

// Mock response data
const mockConfigData = {
  value: '{"stripe_fee": 0.03, "platform_fee": 0.05}'
};

describe('usePaymentConfig', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Create a wrapper component for the QueryClientProvider
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should return payment config data when successful', async () => {
    // Setup mock response
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.single as any).mockResolvedValue({
      data: mockConfigData,
      error: null
    });

    // Render the hook
    const { result, rerender } = renderHook(() => usePaymentConfig(), {
      wrapper
    });

    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the query to resolve
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the data
    expect(result.current.paymentConfig).toEqual({
      stripe_fee: 0.03,
      platform_fee: 0.05
    });
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);

    // Ensure supabase.from was called correctly
    expect(supabase.from).toHaveBeenCalledWith('app_config');
    expect(supabase.select).toHaveBeenCalled();
    expect(supabase.eq).toHaveBeenCalledWith('key', 'PAYMENT_FEES');
  });

  it('should return error state when API call fails', async () => {
    // Setup mock error response
    const mockError = new Error('Failed to fetch payment config');
    
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.single as any).mockResolvedValue({
      data: null,
      error: mockError
    });

    // Render the hook
    const { result, rerender } = renderHook(() => usePaymentConfig(), {
      wrapper
    });

    // Wait for the query to resolve
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify error state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeTruthy();
    expect(result.current.paymentConfig).toEqual({
      stripe_fee: 0.029,
      platform_fee: 0.02
    }); // Should return default values
  });
});
