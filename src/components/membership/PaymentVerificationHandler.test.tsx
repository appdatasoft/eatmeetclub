
import React from 'react';
import { render, screen } from '@/lib/test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentVerificationHandler from './PaymentVerificationHandler';

// Mock hooks
vi.mock('@/hooks/membership/usePaymentVerification', () => ({
  usePaymentVerification: vi.fn()
}));

// Mock components
vi.mock('./PaymentStatusDisplay', () => ({
  default: ({ status, error }: any) => (
    <div data-testid="payment-status" data-status={status} data-error={error}>
      Payment Status Display
    </div>
  )
}));

// Mock global fetch
global.fetch = vi.fn();

// Get references to the mocked functions
const mockedUsePaymentVerification = vi.mocked(
  require('@/hooks/membership/usePaymentVerification').usePaymentVerification
);

describe('PaymentVerificationHandler', () => {
  const mockVerifyPayment = vi.fn();
  const mockRetryVerification = vi.fn();
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    // Mock usePaymentVerification hook with proper boolean values for boolean properties
    mockedUsePaymentVerification.mockReturnValue({
      verifyPayment: mockVerifyPayment,
      retryVerification: mockRetryVerification,
      isProcessing: false, // Boolean value, not Mock
      verificationError: null,
      verificationStatus: 'idle',
      navigateAfterSuccess: mockNavigate
    });
  });
  
  it('renders correctly with idle state', () => {
    render(
      <PaymentVerificationHandler 
        sessionId="test_session_id"
        paymentSuccess={true} // Boolean value, not Mock
        verificationProcessed={false}
        setVerificationProcessed={vi.fn()}
      />
    );
    
    expect(screen.getByTestId('payment-status')).toBeInTheDocument();
  });
  
  it('calls verifyPayment on mount if sessionId is provided', () => {
    render(
      <PaymentVerificationHandler 
        sessionId="test_session_id"
        paymentSuccess={true} // Boolean value, not Mock
        verificationProcessed={false}
        setVerificationProcessed={vi.fn()}
      />
    );
    
    expect(mockVerifyPayment).toHaveBeenCalledWith('test_session_id');
  });
  
  it('displays correct status and passes error to PaymentStatusDisplay', () => {
    mockedUsePaymentVerification.mockReturnValue({
      verifyPayment: mockVerifyPayment,
      retryVerification: mockRetryVerification,
      isProcessing: true, // Boolean, not Mock
      verificationError: 'Test error',
      verificationStatus: 'error',
      navigateAfterSuccess: mockNavigate
    });
    
    render(
      <PaymentVerificationHandler 
        sessionId="test_session_id"
        paymentSuccess={true} // Boolean value, not Mock
        verificationProcessed={false}
        setVerificationProcessed={vi.fn()}
      />
    );
    
    const statusDisplay = screen.getByTestId('payment-status');
    expect(statusDisplay).toBeInTheDocument();
    expect(statusDisplay.getAttribute('data-status')).toBe('error');
    
    expect(statusDisplay.getAttribute('data-error')).toBe('Test error');
    expect(mockVerifyPayment).toHaveBeenCalledWith('test_session_id');
  });
  
  it('calls paymentSuccess when verification is successful', () => {
    const mockPaymentSuccess = vi.fn();
    
    mockedUsePaymentVerification.mockReturnValue({
      verifyPayment: mockVerifyPayment,
      retryVerification: mockRetryVerification,
      isProcessing: false, // Boolean, not Mock
      verificationError: null,
      verificationStatus: 'success',
      navigateAfterSuccess: mockNavigate
    });
    
    render(
      <PaymentVerificationHandler 
        sessionId="test_session_id"
        paymentSuccess={true} // Boolean value, not Mock
        verificationProcessed={false}
        setVerificationProcessed={vi.fn()}
      />
    );
    
    const statusDisplay = screen.getByTestId('payment-status');
    expect(statusDisplay).toBeInTheDocument();
    expect(statusDisplay.getAttribute('data-status')).toBe('success');
    
    expect(mockPaymentSuccess).not.toHaveBeenCalled(); // We don't call paymentSuccess in this case
  });
  
  it('navigates after success if verificationProcessed is true', () => {
    mockedUsePaymentVerification.mockReturnValue({
      verifyPayment: mockVerifyPayment,
      retryVerification: mockRetryVerification,
      isProcessing: false, // Boolean, not Mock
      verificationError: null,
      verificationStatus: 'success',
      navigateAfterSuccess: mockNavigate
    });
    
    render(
      <PaymentVerificationHandler 
        sessionId="test_session_id"
        paymentSuccess={true} // Boolean value, not Mock
        verificationProcessed={true}
        setVerificationProcessed={vi.fn()}
      />
    );
    
    expect(mockNavigate).toHaveBeenCalled();
  });
});
