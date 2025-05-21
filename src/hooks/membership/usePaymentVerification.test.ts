
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePaymentVerification } from './usePaymentVerification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn())
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('usePaymentVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('signup_email', 'test@example.com');
    localStorageMock.setItem('signup_name', 'Test User');
  });

  it('should successfully verify payment', async () => {
    // Mock successful payment verification
    const mockSuccessResponse = { data: { success: true } };
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

    const mockToast = vi.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    const mockNavigate = vi.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() => usePaymentVerification({
      onSuccess: mockOnSuccess
    }));

    await act(async () => {
      await result.current.verifyPayment('pi_123456789');
    });

    // Verify that the correct function was called
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'verify-membership-payment',
      {
        body: {
          paymentId: 'pi_123456789',
          email: 'test@example.com'
        }
      }
    );

    // Verify success callbacks
    expect(mockToast).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should handle payment verification error', async () => {
    // Mock failed payment verification
    const mockErrorResponse = { error: { message: 'Verification failed' } };
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

    const mockToast = vi.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    const mockOnError = vi.fn();

    const { result } = renderHook(() => usePaymentVerification({
      onError: mockOnError
    }));

    let response;
    await act(async () => {
      response = await result.current.verifyPayment('pi_invalid');
    });

    // Verify error handling
    expect(response).toEqual({ success: false, error: 'Verification failed' });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive'
    }));
    expect(mockOnError).toHaveBeenCalledWith('Verification failed');
  });

  it('should handle missing email', async () => {
    localStorageMock.removeItem('signup_email');

    const mockToast = vi.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    const mockOnError = vi.fn();

    const { result } = renderHook(() => usePaymentVerification({
      onError: mockOnError
    }));

    let response;
    await act(async () => {
      response = await result.current.verifyPayment('pi_123456789');
    });

    // Verify error handling for missing email
    expect(response).toEqual({ success: false, error: 'Missing email for verification' });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive'
    }));
    expect(mockOnError).toHaveBeenCalledWith('Missing email for verification');
  });

  it('should handle API exceptions', async () => {
    // Mock API exception
    (supabase.functions.invoke as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const mockToast = vi.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    const mockOnError = vi.fn();

    const { result } = renderHook(() => usePaymentVerification({
      onError: mockOnError
    }));

    let response;
    await act(async () => {
      response = await result.current.verifyPayment('pi_123456789');
    });

    // Verify exception handling
    expect(response).toEqual({ success: false, error: 'Network error' });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive'
    }));
    expect(mockOnError).toHaveBeenCalledWith('Network error');
  });

  it('should clear local storage on success', async () => {
    // Set up localStorage
    localStorageMock.setItem('signup_email', 'test@example.com');
    localStorageMock.setItem('signup_name', 'Test User');
    localStorageMock.setItem('signup_phone', '1234567890');
    localStorageMock.setItem('signup_address', '123 Main St');
    
    // Mock successful payment verification
    const mockSuccessResponse = { data: { success: true } };
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

    const { result } = renderHook(() => usePaymentVerification({}));

    await act(async () => {
      await result.current.verifyPayment('pi_123456789');
    });

    // Verify localStorage was cleared
    expect(localStorageMock.getItem('signup_email')).toBeNull();
    expect(localStorageMock.getItem('signup_name')).toBeNull();
    expect(localStorageMock.getItem('signup_phone')).toBeNull();
    expect(localStorageMock.getItem('signup_address')).toBeNull();
  });

  it('should return verification data', async () => {
    const mockVerificationData = { 
      data: { 
        success: true,
        userId: 'user_123',
        userCreated: false,
        membershipId: 'mem_123'
      } 
    };
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce(mockVerificationData);

    const { result } = renderHook(() => usePaymentVerification({}));

    let response;
    await act(async () => {
      response = await result.current.verifyPayment('pi_123456789');
    });

    // Verify returned data
    expect(response).toEqual(mockVerificationData.data);
  });
});
