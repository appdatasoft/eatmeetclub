
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTicketDistribution } from '../useTicketDistribution';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockSingle = vi.fn();
  const mockOrder = vi.fn();
  const mockEq = vi.fn();
  
  return {
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(() => {
        mockEq.mockReturnValue({ error: null, data: null });
        return mockEq();
      }),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => {
        mockOrder.mockReturnValue({ data: [], error: null });
        return mockOrder();
      }),
      single: vi.fn().mockImplementation(() => {
        mockSingle.mockReturnValue({ data: {}, error: null });
        return mockSingle();
      })
    }
  };
});

describe('useTicketDistribution hook', () => {
  const mockEventId = 'event-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should initialize with default values and loading state', () => {
    // Mock database calls to simulate loading state
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnValue(new Promise(() => {}))
    } as any);
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.distributionConfig).toEqual({
      appFeePercentage: 5,
      affiliateFeePercentage: 10,
      ambassadorFeePercentage: 15
    });
  });
  
  it('should fetch configuration from database', async () => {
    // Mock event config response
    const mockSingleFn = vi.fn()
      .mockResolvedValueOnce({
        data: {
          ambassador_fee_percentage: 12, // Event-specific override
          restaurant_id: 'rest-123'
        },
        error: null
      })
      .mockResolvedValueOnce({
        data: {
          default_ambassador_fee_percentage: null // Restaurant has no default
        },
        error: null
      });
    
    // Mock app config response
    const mockOrderFn = vi.fn().mockResolvedValueOnce({
      data: [
        { key: 'APP_FEE_PERCENTAGE', value: '4' },
        { key: 'AFFILIATE_FEE_PERCENTAGE', value: '8' }
      ],
      error: null
    });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: mockOrderFn,
      single: mockSingleFn
    } as any);
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    // Wait for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Test completed loading
    expect(result.current.isLoading).toBe(false);
    
    // Check that config was updated properly
    expect(result.current.distributionConfig).toEqual({
      appFeePercentage: 4, // From app config
      affiliateFeePercentage: 8, // From app config
      ambassadorFeePercentage: 12 // From event-specific override
    });
  });
  
  it('should calculate revenue distribution correctly', async () => {
    // Set up mock responses
    const mockSingleFn = vi.fn()
      .mockResolvedValueOnce({
        data: { ambassador_fee_percentage: 10, restaurant_id: 'rest-123' },
        error: null
      })
      .mockResolvedValueOnce({
        data: { default_ambassador_fee_percentage: null },
        error: null
      });
    
    const mockOrderFn = vi.fn().mockResolvedValueOnce({
      data: [
        { key: 'APP_FEE_PERCENTAGE', value: '5' },
        { key: 'AFFILIATE_FEE_PERCENTAGE', value: '10' }
      ],
      error: null
    });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: mockOrderFn,
      single: mockSingleFn
    } as any);
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    // Wait for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Calculate for a $100 ticket, 2 quantity
    const distribution = result.current.calculateDistribution(100, 2);
    
    // Total amount: $100 × 2 = $200
    expect(distribution.totalAmount).toBe(200);
    
    // App fee: 5% of $200 = $10
    expect(distribution.appFee).toBe(10);
    
    // Affiliate fee: 10% of $200 = $20
    expect(distribution.affiliateFee).toBe(20);
    
    // Ambassador fee: 10% of $200 = $20
    expect(distribution.ambassadorFee).toBe(20);
    
    // Restaurant revenue: $200 - ($10 + $20 + $20) = $150
    expect(distribution.restaurantRevenue).toBe(150);
  });
  
  it('should update ambassador fee percentage', async () => {
    const newPercentage = 20;
    
    // Mock responses for initial loading
    const mockSingleFn = vi.fn()
      .mockResolvedValueOnce({
        data: { ambassador_fee_percentage: 15, restaurant_id: 'rest-123' },
        error: null
      })
      .mockResolvedValueOnce({
        data: { default_ambassador_fee_percentage: 10 },
        error: null
      });
    
    const mockOrderFn = vi.fn().mockResolvedValueOnce({
      data: [],
      error: null
    });

    const mockEqFn = vi.fn().mockResolvedValue({ error: null, data: null });
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(() => mockEqFn()),
      in: vi.fn().mockReturnThis(),
      order: mockOrderFn,
      single: mockSingleFn
    } as any);
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    // Wait for initial data loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Now attempt to update the fee percentage
    let success;
    await act(async () => {
      success = await result.current.updateAmbassadorFeePercentage(newPercentage);
    });
    
    expect(success).toBe(true);
    expect(result.current.distributionConfig.ambassadorFeePercentage).toBe(newPercentage);
  });
});
