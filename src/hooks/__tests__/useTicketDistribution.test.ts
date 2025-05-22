
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTicketDistribution } from '../useTicketDistribution';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

describe('useTicketDistribution hook', () => {
  const mockEventId = 'event-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should initialize with default values and loading state', () => {
    // Mock database calls to prevent resolution during test
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => new Promise(() => {}) // Never resolves to keep loading state
        })
      })
    }));
    
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
    (supabase.single as any).mockResolvedValueOnce({
      data: {
        ambassador_fee_percentage: 12, // Event-specific override
        restaurant_id: 'rest-123'
      },
      error: null
    }).mockResolvedValueOnce({
      data: {
        default_ambassador_fee_percentage: null // Restaurant has no default
      },
      error: null
    });
    
    // Mock app config response
    (supabase.order as any).mockResolvedValueOnce({
      data: [
        { key: 'APP_FEE_PERCENTAGE', value: '4' },
        { key: 'AFFILIATE_FEE_PERCENTAGE', value: '8' }
      ],
      error: null
    });
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.distributionConfig).toEqual({
      appFeePercentage: 4, // From app config
      affiliateFeePercentage: 8, // From app config
      ambassadorFeePercentage: 12 // From event-specific override
    });
  });
  
  it('should calculate revenue distribution correctly', async () => {
    // Fast-forward loading to complete
    (supabase.single as any).mockResolvedValueOnce({
      data: { ambassador_fee_percentage: null, restaurant_id: 'rest-123' },
      error: null
    }).mockResolvedValueOnce({
      data: { default_ambassador_fee_percentage: 10 },
      error: null
    });
    
    (supabase.order as any).mockResolvedValueOnce({
      data: [
        { key: 'APP_FEE_PERCENTAGE', value: '5' },
        { key: 'AFFILIATE_FEE_PERCENTAGE', value: '10' }
      ],
      error: null
    });
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
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
  
  it('should handle missing configuration values gracefully', async () => {
    // Mock empty responses
    (supabase.single as any).mockResolvedValueOnce({
      data: { ambassador_fee_percentage: null, restaurant_id: 'rest-123' },
      error: null
    }).mockResolvedValueOnce({
      data: { default_ambassador_fee_percentage: null },
      error: null
    });
    
    (supabase.order as any).mockResolvedValueOnce({
      data: [], // No app config values
      error: null
    });
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should use default values when config is missing
    expect(result.current.distributionConfig).toEqual({
      appFeePercentage: 5, // Default
      affiliateFeePercentage: 10, // Default
      ambassadorFeePercentage: 15 // Default
    });
  });
  
  it('should update ambassador fee percentage', async () => {
    const newPercentage = 20;
    (supabase.eq as any).mockResolvedValue({ error: null });
    
    // Fast-forward initial loading
    (supabase.single as any).mockResolvedValueOnce({
      data: { ambassador_fee_percentage: 15, restaurant_id: 'rest-123' },
      error: null
    }).mockResolvedValueOnce({
      data: { default_ambassador_fee_percentage: 10 },
      error: null
    });
    
    (supabase.order as any).mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    let success;
    await waitFor(async () => {
      success = await result.current.updateAmbassadorFeePercentage(newPercentage);
    });
    
    expect(success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(supabase.update).toHaveBeenCalledWith({ ambassador_fee_percentage: newPercentage });
    expect(supabase.eq).toHaveBeenCalledWith('id', mockEventId);
    
    expect(result.current.distributionConfig.ambassadorFeePercentage).toBe(newPercentage);
  });
  
  it('should handle database errors when updating', async () => {
    const mockError = new Error('Database error');
    
    // Fast-forward initial loading
    (supabase.single as any).mockResolvedValueOnce({
      data: { ambassador_fee_percentage: 15, restaurant_id: 'rest-123' },
      error: null
    }).mockResolvedValueOnce({
      data: { default_ambassador_fee_percentage: 10 },
      error: null
    });
    
    (supabase.order as any).mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Mock update error
    (supabase.eq as any).mockRejectedValue(mockError);
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useTicketDistribution(mockEventId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    let success;
    await waitFor(async () => {
      success = await result.current.updateAmbassadorFeePercentage(20);
    });
    
    expect(success).toBe(false);
    expect(console.error).toHaveBeenCalled();
    
    // Config should not change on error
    expect(result.current.distributionConfig.ambassadorFeePercentage).toBe(15);
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
