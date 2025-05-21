
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useStripeMode } from './useStripeMode';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('useStripeMode', () => {
  const mockResponse = (data: any, error = null) => ({
    data,
    error,
    count: data?.length || 0
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup a more compatible mock that doesn't cause TypeScript issues
    vi.mocked(supabase.from).mockImplementation(() => {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
      } as any;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('returns test mode when in development environment', async () => {
    // Save original NODE_ENV
    const originalEnv = import.meta.env.MODE;
    
    // Mock environment to development
    vi.stubEnv('MODE', 'development');
    
    // Mock the Supabase response for test mode
    const mockSingle = vi.fn().mockResolvedValue(
      mockResponse({ value: 'test' })
    );
    
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle
    }) as any);

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    // Initially should be null
    expect(result.current.stripeMode).toBeNull();
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the hook to update
    await waitForNextUpdate();
    
    expect(result.current.stripeMode).toBe('test');
    expect(result.current.isLoading).toBe(false);
    
    // Restore original NODE_ENV
    vi.stubEnv('MODE', originalEnv);
  });

  it('returns live mode when set in config', async () => {
    // Mock the Supabase response for live mode
    const mockSingle = vi.fn().mockResolvedValue(
      mockResponse({ value: 'live' })
    );
    
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle
    }) as any);

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    // Wait for the hook to update
    await waitForNextUpdate();
    
    expect(result.current.stripeMode).toBe('live');
    expect(result.current.isLoading).toBe(false);
  });

  it('falls back to test mode when error occurs', async () => {
    // Mock a Supabase error
    const mockError = { message: 'Database error' };
    const mockSingle = vi.fn().mockResolvedValue(
      mockResponse(null, mockError)
    );
    
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle
    }) as any);

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());
    
    // Wait for the hook to update
    await waitForNextUpdate();
    
    expect(result.current.stripeMode).toBe('test');
    expect(result.current.isLoading).toBe(false);
  });

  it('uses cached mode when available', async () => {
    // Set a cached mode
    localStorage.setItem('stripe_mode', 'live');
    
    const { result } = renderHook(() => useStripeMode());
    
    // Should immediately use the cached value
    expect(result.current.stripeMode).toBe('live');
    expect(result.current.isLoading).toBe(false);
    
    // Clear for other tests
    localStorage.removeItem('stripe_mode');
  });
});
