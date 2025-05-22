
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTicketDistribution } from '../useTicketDistribution';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client with proper type
vi.mock('@/integrations/supabase/client', () => {
  // Create a properly typed mock object
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn()
  };
  
  return {
    supabase: mockSupabase
  };
});

describe('useTicketDistribution hook', () => {
  const mockEventId = 'event-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should initialize with default values and loading state', () => {
    // Mock database calls to simulate loading state
    vi.mocked(supabase.single).mockReturnValue(new Promise(() => {}));
    
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
    vi.mocked(supabase.single)
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
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [
        { key: 'APP_FEE_PERCENTAGE', value: '4' },
        { key: 'AFFILIATE_FEE_PERCENTAGE', value: '8' }
      ],
      error: null
    });
    
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
    vi.mocked(supabase.single)
      .mockResolvedValueOnce({
        data: { ambassador_fee_percentage: 10, restaurant_id: 'rest-123' },
        error: null
      })
      .mockResolvedValueOnce({
        data: { default_ambassador_fee_percentage: null },
        error: null
      });
    
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [
        { key: 'APP_FEE_PERCENTAGE', value: '5' },
        { key: 'AFFILIATE_FEE_PERCENTAGE', value: '10' }
      ],
      error: null
    });
    
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
    vi.mocked(supabase.single)
      .mockResolvedValueOnce({
        data: { ambassador_fee_percentage: 15, restaurant_id: 'rest-123' },
        error: null
      })
      .mockResolvedValueOnce({
        data: { default_ambassador_fee_percentage: 10 },
        error: null
      });
    
    vi.mocked(supabase.order).mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Mock successful update
    vi.mocked(supabase.eq).mockResolvedValueOnce({ error: null, data: null });
    
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
