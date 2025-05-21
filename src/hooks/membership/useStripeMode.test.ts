
import { renderHook, act } from '@testing-library/react-hooks';
import { useStripeMode } from './useStripeMode';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the fetch function
global.fetch = vi.fn();

describe('useStripeMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useStripeMode());

    expect(result.current.mode).toBe('test'); // Default mode
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.stripeCheckError).toBe('');
    expect(result.current.isStripeTestMode).toBe(true);
  });

  it('should update mode when updateStripeMode is called', async () => {
    // Mock the fetch response for successful update
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    const { result, waitForNextUpdate } = renderHook(() => useStripeMode());

    await act(async () => {
      const success = await result.current.updateStripeMode('live');
      expect(success).toBe(true);
    });

    expect(result.current.mode).toBe('live');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('update-stripe-mode'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.stringContaining('"mode":"live"'),
      })
    );
  });

  it('should handle fetch error in updateStripeMode', async () => {
    // Mock the fetch to throw an error
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useStripeMode());

    await act(async () => {
      const success = await result.current.updateStripeMode('live');
      expect(success).toBe(false);
    });

    expect(result.current.mode).toBe('test'); // Mode should remain unchanged
    expect(result.current.error).toBe('Network error');
  });

  it('should handle API error response in updateStripeMode', async () => {
    // Mock the fetch to return an error response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid mode' }),
      })
    );

    const { result } = renderHook(() => useStripeMode());

    await act(async () => {
      const success = await result.current.updateStripeMode('live');
      expect(success).toBe(false);
    });

    expect(result.current.mode).toBe('test'); // Mode should remain unchanged
    expect(result.current.error).toBe('Error updating Stripe mode: 400 Bad Request');
  });

  it('should retry stripe check when handleRetryStripeCheck is called', async () => {
    // Mock the fetch response for successful check
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ mode: 'test' }),
      })
    );

    const { result } = renderHook(() => useStripeMode());

    await act(async () => {
      result.current.handleRetryStripeCheck();
    });

    expect(result.current.mode).toBe('test');
    expect(result.current.stripeCheckError).toBe('');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('check-stripe-mode'),
      expect.any(Object)
    );
  });
});
