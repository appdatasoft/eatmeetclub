
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePaymentConfig } from '../usePaymentConfig';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis()
  }
}));

describe('usePaymentConfig hook', () => {
  let queryClient: QueryClient;
  
  // Create a wrapper with QueryClientProvider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0
        }
      }
    });
  });
  
  it('should return default config when no data is returned', async () => {
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        in: () => Promise.resolve({ data: [], error: null })
      })
    }));
    
    const { result } = renderHook(() => usePaymentConfig(), { wrapper });
    
    // Initial state while loading
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual({
      serviceFeePercent: 0,
      commissionFeePercent: 0,
      stripeMode: 'test'
    });
  });
  
  it('should return config with values from database', async () => {
    const mockDbData = [
      { key: 'service_fee_percent', value: '2.5' },
      { key: 'commission_fee_percent', value: '10' },
      { key: 'stripe_mode', value: 'live' }
    ];
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        in: () => Promise.resolve({ data: mockDbData, error: null })
      })
    }));
    
    const { result } = renderHook(() => usePaymentConfig(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual({
      serviceFeePercent: 2.5,
      commissionFeePercent: 10,
      stripeMode: 'live'
    });
  });
  
  it('should handle errors and return defaults', async () => {
    const mockError = new Error('Database error');
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        in: () => Promise.resolve({ data: null, error: mockError })
      })
    }));
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => usePaymentConfig(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual({
      serviceFeePercent: 0,
      commissionFeePercent: 0,
      stripeMode: 'test'
    });
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should use fallback values when primary keys are missing', async () => {
    const mockDbData = [
      { key: 'ticket_commission_value', value: '3.5' },
      { key: 'signup_commission_value', value: '7.5' },
      { key: 'stripe_mode', value: 'test' }
    ];
    
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        in: () => Promise.resolve({ data: mockDbData, error: null })
      })
    }));
    
    const { result } = renderHook(() => usePaymentConfig(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual({
      serviceFeePercent: 3.5,
      commissionFeePercent: 7.5,
      stripeMode: 'test'
    });
  });
});
