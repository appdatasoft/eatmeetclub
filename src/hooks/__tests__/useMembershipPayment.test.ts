
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMembershipPayment } from '../useMembershipPayment';
import { useNavigate } from 'react-router-dom';
import { useUrlParams } from '@/hooks/membership/useUrlParams';
import { useMembershipConfig } from '@/hooks/membership/useMembershipConfig';
import { useFormSubmission } from '@/hooks/membership/useFormSubmission';
import { usePaymentVerification } from '@/hooks/membership/usePaymentVerification';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@/hooks/membership/useUrlParams', () => ({
  useUrlParams: vi.fn()
}));

vi.mock('@/hooks/membership/useMembershipConfig', () => ({
  useMembershipConfig: vi.fn()
}));

vi.mock('@/hooks/membership/useFormSubmission', () => ({
  useFormSubmission: vi.fn()
}));

vi.mock('@/hooks/membership/usePaymentVerification', () => ({
  usePaymentVerification: vi.fn()
}));

describe('useMembershipPayment hook', () => {
  const mockNavigate = vi.fn();
  const mockVerifyPayment = vi.fn();
  const mockHandleSubmit = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Configure mocks
    (useNavigate as any).mockReturnValue(mockNavigate);
    
    (useUrlParams as any).mockReturnValue({
      paymentCanceled: false,
      paymentSuccess: false,
      sessionId: null
    });
    
    (useMembershipConfig as any).mockReturnValue({
      membershipFee: 99.99,
      isLoading: false
    });
    
    (useFormSubmission as any).mockReturnValue({
      handleSubmit: mockHandleSubmit
    });
    
    (usePaymentVerification as any).mockReturnValue({
      verifyPayment: mockVerifyPayment
    });
    
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
  });
  
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMembershipPayment());
    
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.formErrors).toEqual({});
    expect(result.current.networkError).toBe(null);
    expect(result.current.clientSecret).toBe(null);
    expect(result.current.membershipFee).toBe(99.99);
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should handle successful payment verification', async () => {
    // Set up successful payment scenario
    (useUrlParams as any).mockReturnValue({
      paymentSuccess: true,
      sessionId: 'test-session-id',
      paymentCanceled: false
    });
    
    (Storage.prototype.getItem as any).mockReturnValue('test@example.com');
    
    const { result } = renderHook(() => useMembershipPayment());
    
    // Should attempt to verify payment with the session ID
    expect(mockVerifyPayment).toHaveBeenCalledWith('test-session-id');
  });
  
  it('should show error when email is missing for verification', async () => {
    // Set up payment success but missing email
    (useUrlParams as any).mockReturnValue({
      paymentSuccess: true,
      sessionId: 'test-session-id',
      paymentCanceled: false
    });
    
    (Storage.prototype.getItem as any).mockReturnValue(null);
    
    const { result } = renderHook(() => useMembershipPayment());
    
    // Should not attempt verification
    expect(mockVerifyPayment).not.toHaveBeenCalled();
    
    // Should set network error
    expect(result.current.networkError).toContain('Missing email for payment verification');
  });
  
  it('should handle manual payment verification', () => {
    // Setup payment intent ID but not in URL params
    const { result } = renderHook(() => useMembershipPayment());
    
    // Manually set payment intent ID
    act(() => {
      // @ts-ignore - accessing private fields for testing
      result.current.paymentIntentId = 'manual-payment-id';
    });
    
    // Mock email existence
    (Storage.prototype.getItem as any).mockReturnValue('test@example.com');
    
    // Trigger manual verification
    act(() => {
      result.current.handlePaymentSuccess();
    });
    
    // Should verify with the manual ID
    expect(mockVerifyPayment).toHaveBeenCalledWith('manual-payment-id');
  });
  
  it('should navigate on cancel', () => {
    const { result } = renderHook(() => useMembershipPayment());
    
    // Trigger cancel
    act(() => {
      result.current.handleCancel();
    });
    
    // Should navigate to home
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
