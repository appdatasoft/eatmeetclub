
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, beforeEach } from 'vitest';
import { useVerificationRequest } from './useVerificationRequest';

// Mock fetch
global.fetch = vi.fn();

describe('useVerificationRequest', () => {
  const mockFetch = global.fetch as vi.MockedFunction<typeof fetch>;
  
  beforeEach(() => {
    vi.clearAllMocks();
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
      json: () => Promise.resolve({ success: true, userId: 'user_123' })
    } as unknown as Response);
    
    const { result } = renderHook(() => useVerificationRequest());
    
    let response;
    await act(async () => {
      response = await result.current.sendVerificationRequest(
        'session_123',
        'test@example.com',
        'Test User',
        { 
          phone: '123456', 
          address: '123 Test St',
          isSubscription: true,
          forceCreateUser: false,
          sendPasswordEmail: true,
          createMembershipRecord: true,
          sendInvoiceEmail: true,
          preventDuplicateEmails: false,
          simplifiedVerification: false,
          safeMode: false,
          forceSendEmails: false
        }
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
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ success: false, message: 'Verification failed' })
    } as unknown as Response);
    
    const { result } = renderHook(() => useVerificationRequest());
    
    let error;
    await act(async () => {
      try {
        await result.current.sendVerificationRequest(
          'session_123',
          'test@example.com',
          'Test User',
          {
            phone: null,
            address: null,
            isSubscription: true,
            forceCreateUser: false,
            sendPasswordEmail: true,
            createMembershipRecord: true,
            sendInvoiceEmail: true,
            preventDuplicateEmails: false,
            simplifiedVerification: false,
            safeMode: false,
            forceSendEmails: false
          }
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
          'Test User',
          {
            phone: null,
            address: null,
            isSubscription: true,
            forceCreateUser: false,
            sendPasswordEmail: true,
            createMembershipRecord: true,
            sendInvoiceEmail: true,
            preventDuplicateEmails: false,
            simplifiedVerification: false,
            safeMode: false,
            forceSendEmails: false
          }
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
          'Test User',
          {
            phone: null,
            address: null,
            isSubscription: true,
            forceCreateUser: false,
            sendPasswordEmail: true,
            createMembershipRecord: true,
            sendInvoiceEmail: true,
            preventDuplicateEmails: false,
            simplifiedVerification: false,
            safeMode: false,
            forceSendEmails: false
          }
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
