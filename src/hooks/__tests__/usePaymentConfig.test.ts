import React, { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePaymentConfig } from '../usePaymentConfig';
import { supabase } from '@/integrations/supabase/client';

// ✅ Supabase mock
vi.mock('@/integrations/supabase/client', () => {
  const mockIn = vi.fn();
  const mockSelect = vi.fn(() => ({ in: mockIn }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  return {
    supabase: {
      from: mockFrom,
      __mock: { in: mockIn },
    },
  };
});

// ✅ Use named interface instead of inline type (fixes TS1005)
interface WrapperProps {
  children: ReactNode;
}

describe('usePaymentConfig hook', () => {
  let queryClient: QueryClient;
  const mockIn = (supabase as any).__mock.in;

  const wrapper = ({ children }: WrapperProps) => {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
  });

  it('returns default config when no data is returned', async () => {
    mockIn.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => usePaymentConfig(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual({
      serviceFeePercent: 0,
      commissionFeePercent: 0,
      stripeMode: 'test',
    });
  });

  it('returns config with values from database', async () => {
    mockIn.mockResolvedValue({
      data: [
        { key: 'service_fee_percent', value: '2.5' },
        { key: 'commission_fee_percent', value: '10' },
        { key: 'stripe_mode', value: 'live' },
      ],
      error: null,
    });

    const { result } = renderHook(() => usePaymentConfig(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual({
      serviceFeePercent: 2.5,
      commissionFeePercent: 10,
      stripeMode: 'live',
    });
  });

  it('returns fallback values when primary keys are missing', async () => {
    mockIn.mockResolvedValue({
      data: [
        { key: 'ticket_commission_value', value: '3.5' },
        { key: 'signup_commission_value', value: '7.5' },
        { key: 'stripe_mode', value: 'test' },
      ],
      error: null,
    });

    const { result } = renderHook(() => usePaymentConfig(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual({
      serviceFeePercent: 3.5,
      commissionFeePercent: 7.5,
      stripeMode: 'test',
    });
  });

  it('handles errors and returns default config', async () => {
    mockIn.mockResolvedValue({ data: null, error: new Error('Database error') });

    const originalConsoleError = console.error;
    console.error = vi.fn();

    const { result } = renderHook(() => usePaymentConfig(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual({
      serviceFeePercent: 0,
      commissionFeePercent: 0,
      stripeMode: 'test',
    });

    expect(console.error).toHaveBeenCalled();
    console.error = originalConsoleError;
  });
});
