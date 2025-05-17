
import { renderHook, act } from '@testing-library/react-hooks';
import { useVerificationRequest } from './useVerificationRequest';

// Mock fetch
global.fetch = jest.fn();

describe('useVerificationRequest', () => {
  const mockFetch = global.fetch as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVerificationRequest());
    
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.verificationError).toBeNull();
    expect(result.current.verificationAttempts).toBe(0);
  });

  it('should send verification request successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ success: true, userId: 'user_123' })
    });
    
    const { result } = renderHook(() => useVerificationRequest());
    
    let response;
    await act(async () => {
      response = await result.current.sendVerificationRequest(
        'session_123',
        'test@example.com',
        'Test User',
        { phone: '123456', address: '123 Test St' }
      );
    });
    
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.verificationAttempts).toBe(1);
    expect(result.current.verificationError).toBeNull();
    expect(response).toEqual({ success: true, userId: 'user_123' });
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/verify-membership-payment'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('session_123')
      })
    );
  });

  it('should handle verification request failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValueOnce({ success: false, message: 'Verification failed' })
    });
    
    const { result } = renderHook(() => useVerificationRequest());
    
    let error;
    await act(async () => {
      try {
        await result.current.sendVerificationRequest(
          'session_123',
          'test@example.com',
          'Test User'
        );
      } catch (e) {
        error = e;
      }
    });
    
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.verificationAttempts).toBe(1);
    expect(result.current.verificationError).toBe('Verification failed');
    expect(error).toBeTruthy();
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useVerificationRequest());
    
    let error;
    await act(async () => {
      try {
        await result.current.sendVerificationRequest(
          'session_123',
          'test@example.com',
          'Test User'
        );
      } catch (e) {
        error = e;
      }
    });
    
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.verificationAttempts).toBe(1);
    expect(result.current.verificationError).toBe('Network error');
    expect(error).toBeTruthy();
  });

  it('should reset verification attempts', async () => {
    // First request fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useVerificationRequest());
    
    await act(async () => {
      try {
        await result.current.sendVerificationRequest(
          'session_123',
          'test@example.com',
          'Test User'
        );
      } catch (e) {
        // Ignore error
      }
    });
    
    expect(result.current.verificationAttempts).toBe(1);
    
    // Reset attempts
    act(() => {
      result.current.setVerificationAttempts(0);
    });
    
    expect(result.current.verificationAttempts).toBe(0);
  });
});
