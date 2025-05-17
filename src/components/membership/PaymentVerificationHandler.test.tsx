
import React from 'react';
import { render } from '@testing-library/react';
import PaymentVerificationHandler from './PaymentVerificationHandler';
import { useToast } from '@/hooks/use-toast';
import usePaymentVerification from '@/hooks/membership/usePaymentVerification';
import { useBackupEmail } from '@/hooks/membership/useBackupEmail';
import { useWelcomeEmail } from '@/hooks/membership/useWelcomeEmail';

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn()
}));

jest.mock('@/hooks/membership/usePaymentVerification', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/hooks/membership/useBackupEmail', () => ({
  useBackupEmail: jest.fn()
}));

jest.mock('@/hooks/membership/useWelcomeEmail', () => ({
  useWelcomeEmail: jest.fn()
}));

// Mock LocalStorage
const mockLocalStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key) => mockLocalStorageData[key] ?? null),
  setItem: jest.fn((key, value) => { mockLocalStorageData[key] = value; }),
  removeItem: jest.fn((key) => { delete mockLocalStorageData[key]; }),
  clear: jest.fn(() => { Object.keys(mockLocalStorageData).forEach(key => delete mockLocalStorageData[key]); }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('PaymentVerificationHandler', () => {
  const mockToast = { toast: jest.fn() };
  const mockVerifyPayment = jest.fn();
  const mockSendDirectBackupEmail = jest.fn();
  const mockSendWelcomeEmail = jest.fn();
  const mockSetVerificationProcessed = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockLocalStorageData).forEach(key => delete mockLocalStorageData[key]);
    
    // Setup default test data
    mockLocalStorageData['signup_email'] = 'test@example.com';
    mockLocalStorageData['signup_name'] = 'Test User';
    
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (usePaymentVerification as jest.Mock).mockReturnValue({
      verifyPayment: mockVerifyPayment,
      isVerifying: false,
      verificationAttempts: 0,
      verificationError: null
    });
    (useBackupEmail as jest.Mock).mockReturnValue({
      sendDirectBackupEmail: mockSendDirectBackupEmail
    });
    (useWelcomeEmail as jest.Mock).mockReturnValue({
      sendWelcomeEmail: mockSendWelcomeEmail
    });
  });

  it('does not verify payment if verification already processed', () => {
    render(
      <PaymentVerificationHandler
        sessionId="session_123"
        paymentSuccess={true}
        verificationProcessed={true}
        setVerificationProcessed={mockSetVerificationProcessed}
      />
    );
    
    expect(mockVerifyPayment).not.toHaveBeenCalled();
  });

  it('does not verify payment if session ID is missing', () => {
    render(
      <PaymentVerificationHandler
        sessionId={null}
        paymentSuccess={true}
        verificationProcessed={false}
        setVerificationProcessed={mockSetVerificationProcessed}
      />
    );
    
    expect(mockVerifyPayment).not.toHaveBeenCalled();
  });

  it('shows an error and marks as processed when email is missing', () => {
    // Clear stored email
    delete mockLocalStorageData['signup_email'];
    
    render(
      <PaymentVerificationHandler
        sessionId="session_123"
        paymentSuccess={true}
        verificationProcessed={false}
        setVerificationProcessed={mockSetVerificationProcessed}
      />
    );
    
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: "Email validation failed",
      variant: "destructive",
    }));
    expect(mockSetVerificationProcessed).toHaveBeenCalledWith(true);
    expect(mockVerifyPayment).not.toHaveBeenCalled();
  });

  it('verifies payment successfully with valid data', () => {
    mockVerifyPayment.mockResolvedValueOnce(true);
    
    render(
      <PaymentVerificationHandler
        sessionId="session_123"
        paymentSuccess={true}
        verificationProcessed={false}
        setVerificationProcessed={mockSetVerificationProcessed}
      />
    );
    
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: "Verifying payment"
    }));
    
    expect(mockVerifyPayment).toHaveBeenCalledWith("session_123", expect.objectContaining({
      forceCreateUser: true,
      sendPasswordEmail: true,
      createMembershipRecord: true,
      sendInvoiceEmail: true,
      simplifiedVerification: false,
      retry: true,
      forceSendEmails: true
    }));
  });

  it('sends welcome email after successful verification', async () => {
    mockVerifyPayment.mockResolvedValueOnce(true);
    mockSendWelcomeEmail.mockResolvedValueOnce(true);
    
    render(
      <PaymentVerificationHandler
        sessionId="session_123"
        paymentSuccess={true}
        verificationProcessed={false}
        setVerificationProcessed={mockSetVerificationProcessed}
      />
    );
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
      'session_123'
    );
    
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: "Welcome to our membership!"
    }));
    
    expect(mockSetVerificationProcessed).toHaveBeenCalledWith(true);
    expect(sessionStorage.getItem('checkout_initiated')).toBe(null);
  });

  it('sends backup emails when max verification attempts reached', async () => {
    // Mock verification attempts exceeded
    (usePaymentVerification as jest.Mock).mockReturnValue({
      verifyPayment: mockVerifyPayment.mockResolvedValueOnce(false),
      isVerifying: false,
      verificationAttempts: 3,
      verificationError: null
    });
    
    render(
      <PaymentVerificationHandler
        sessionId="session_123"
        paymentSuccess={true}
        verificationProcessed={false}
        setVerificationProcessed={mockSetVerificationProcessed}
      />
    );
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: "Verification taking longer than expected"
    }));
    
    expect(mockSendDirectBackupEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
      'session_123'
    );
    
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
      'session_123'
    );
    
    expect(mockSetVerificationProcessed).toHaveBeenCalledWith(true);
  });
});
