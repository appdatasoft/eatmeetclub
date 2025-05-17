
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePaymentVerification } from './usePaymentVerification';
import { useToast } from '@/hooks/use-toast';
import { useVerificationRequest } from './payment-verification/useVerificationRequest';
import { useBackupProcessing } from './payment-verification/useBackupProcessing';
import { useUserStorage } from './payment-verification/useUserStorage';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('./payment-verification/useVerificationRequest', () => ({
  useVerificationRequest: vi.fn()
}));

vi.mock('./payment-verification/useBackupProcessing', () => ({
  useBackupProcessing: vi.fn()
}));

vi.mock('./payment-verification/useUserStorage', () => ({
  useUserStorage: vi.fn()
}));

describe('usePaymentVerification', () => {
  const mockSetIsProcessing = vi.fn();
  const mockToast = { toast: vi.fn() };
  const mockSendVerificationRequest = vi.fn();
  const mockHandleSimplifiedVerification = vi.fn();
  const mockSendBackupEmails = vi.fn();
  const mockShowVerificationToasts = vi.fn();
  const mockGetUserDetails = vi.fn();
  const mockClearUserDetails = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useToast as any).mockReturnValue(mockToast);
    
    (useVerificationRequest as any).mockReturnValue({
      sendVerificationRequest: mockSendVerificationRequest,
      isVerifying: false,
      verificationError: null,
      verificationAttempts: 0,
      setVerificationAttempts: vi.fn()
    });
    
    (useBackupProcessing as any).mockReturnValue({
      handleSimplifiedVerification: mockHandleSimplifiedVerification,
      sendBackupEmails: mockSendBackupEmails,
      showVerificationToasts: mockShowVerificationToasts
    });
    
    (useUserStorage as any).mockReturnValue({
      getUserDetails: mockGetUserDetails,
      clearUserDetails: mockClearUserDetails,
      storeUserDetails: vi.fn()
    });
  });

  it('should return verifyPayment function', () => {
    const { result } = renderHook(() => usePaymentVerification({ setIsProcessing: mockSetIsProcessing }));
    
    expect(typeof result.current.verifyPayment).toBe('function');
  });

  it('should not verify payment if email is missing', async () => {
    mockGetUserDetails.mockReturnValue({ email: '', name: '', phone: '', address: '' });
    
    const { result } = renderHook(() => usePaymentVerification({ setIsProcessing: mockSetIsProcessing }));
    
    const success = await result.current.verifyPayment('payment_123');
    
    expect(success).toBe(false);
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: 'Email missing',
      variant: 'destructive'
    }));
    expect(mockSendVerificationRequest).not.toHaveBeenCalled();
  });

  it('should successfully verify payment', async () => {
    mockGetUserDetails.mockReturnValue({ 
      email: 'test@example.com', 
      name: 'Test User', 
      phone: '123456', 
      address: '123 Test St' 
    });
    
    mockSendVerificationRequest.mockResolvedValueOnce({ success: true });
    
    const { result } = renderHook(() => usePaymentVerification({ setIsProcessing: mockSetIsProcessing }));
    
    const success = await result.current.verifyPayment('payment_123');
    
    expect(mockSetIsProcessing).toHaveBeenCalledWith(true);
    expect(mockSendVerificationRequest).toHaveBeenCalledWith(
      'payment_123', 
      'test@example.com', 
      'Test User',
      expect.objectContaining({
        phone: '123456',
        address: '123 Test St',
        isSubscription: true
      })
    );
    expect(mockShowVerificationToasts).toHaveBeenCalledWith({ success: true });
    expect(mockClearUserDetails).toHaveBeenCalled();
    expect(mockSetIsProcessing).toHaveBeenCalledWith(false);
    expect(success).toBe(true);
  });

  it('should try simplified verification as fallback when regular verification fails', async () => {
    mockGetUserDetails.mockReturnValue({ 
      email: 'test@example.com', 
      name: 'Test User', 
      phone: '', 
      address: '' 
    });
    
    mockSendVerificationRequest.mockRejectedValueOnce(new Error('Verification failed'));
    mockHandleSimplifiedVerification.mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => usePaymentVerification({ setIsProcessing: mockSetIsProcessing }));
    
    const success = await result.current.verifyPayment('payment_123', { retry: true });
    
    expect(mockHandleSimplifiedVerification).toHaveBeenCalled();
    expect(mockClearUserDetails).toHaveBeenCalled();
    expect(success).toBe(true);
  });

  it('should send backup emails when all verification attempts fail', async () => {
    mockGetUserDetails.mockReturnValue({ 
      email: 'test@example.com', 
      name: 'Test User', 
      phone: '', 
      address: '' 
    });
    
    mockSendVerificationRequest.mockRejectedValueOnce(new Error('Verification failed'));
    mockHandleSimplifiedVerification.mockResolvedValueOnce(false);
    
    const { result } = renderHook(() => usePaymentVerification({ setIsProcessing: mockSetIsProcessing }));
    
    const success = await result.current.verifyPayment('payment_123', { retry: true });
    
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: 'Verification issue',
      variant: 'destructive'
    }));
    expect(mockSendBackupEmails).toHaveBeenCalledWith('payment_123', 'test@example.com', 'Test User');
    expect(success).toBe(false);
  });

  it('should not verify the same session ID twice', async () => {
    mockGetUserDetails.mockReturnValue({ 
      email: 'test@example.com', 
      name: 'Test User', 
      phone: '', 
      address: '' 
    });
    
    mockSendVerificationRequest.mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => usePaymentVerification({ setIsProcessing: mockSetIsProcessing }));
    
    // First verification
    await result.current.verifyPayment('payment_123');
    expect(mockSendVerificationRequest).toHaveBeenCalledTimes(1);
    
    // Reset mock to check if it's called again
    mockSendVerificationRequest.mockClear();
    
    // Second verification with same ID
    const success = await result.current.verifyPayment('payment_123');
    
    expect(mockSendVerificationRequest).not.toHaveBeenCalled();
    expect(success).toBe(true);
  });

  it('should bypass duplication check when forceSendEmails is true', async () => {
    mockGetUserDetails.mockReturnValue({ 
      email: 'test@example.com', 
      name: 'Test User', 
      phone: '', 
      address: '' 
    });
    
    mockSendVerificationRequest.mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => usePaymentVerification({ setIsProcessing: mockSetIsProcessing }));
    
    // First verification
    await result.current.verifyPayment('payment_123');
    expect(mockSendVerificationRequest).toHaveBeenCalledTimes(1);
    
    // Reset mock to check if it's called again
    mockSendVerificationRequest.mockClear();
    
    // Second verification with force option
    await result.current.verifyPayment('payment_123', { forceSendEmails: true });
    
    expect(mockSendVerificationRequest).toHaveBeenCalledTimes(1);
  });
});
