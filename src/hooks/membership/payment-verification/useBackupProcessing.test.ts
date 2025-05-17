
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBackupProcessing } from './useBackupProcessing';
import { useBackupEmail } from '../useBackupEmail';
import { useInvoiceEmail } from '../useInvoiceEmail';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('../useBackupEmail', () => ({
  useBackupEmail: vi.fn()
}));

vi.mock('../useInvoiceEmail', () => ({
  useInvoiceEmail: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

describe('useBackupProcessing', () => {
  const mockSendDirectBackupEmail = vi.fn();
  const mockSendInvoiceEmail = vi.fn();
  const mockToast = { toast: vi.fn() };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useBackupEmail as any).mockReturnValue({
      sendDirectBackupEmail: mockSendDirectBackupEmail
    });
    
    (useInvoiceEmail as any).mockReturnValue({
      sendInvoiceEmail: mockSendInvoiceEmail
    });
    
    (useToast as any).mockReturnValue(mockToast);
  });

  it('should prepare for simplified verification', async () => {
    const { result } = renderHook(() => useBackupProcessing());
    
    const success = await result.current.handleSimplifiedVerification(
      'payment_123',
      'test@example.com',
      'Test User'
    );
    
    // The function should return true after preparation
    expect(success).toBe(true);
  });

  it('should handle error during simplified verification preparation', async () => {
    // Set up the test to simulate a failure during timeout
    vi.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
      throw new Error('Timeout failed');
    });
    
    const { result } = renderHook(() => useBackupProcessing());
    
    const success = await result.current.handleSimplifiedVerification(
      'payment_123',
      'test@example.com',
      'Test User'
    );
    
    // The function should return false when an error occurs
    expect(success).toBe(false);
  });

  it('should send backup emails successfully', async () => {
    mockSendDirectBackupEmail.mockResolvedValueOnce(true);
    mockSendInvoiceEmail.mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useBackupProcessing());
    
    const success = await result.current.sendBackupEmails(
      'payment_123',
      'test@example.com',
      'Test User'
    );
    
    expect(mockSendDirectBackupEmail).toHaveBeenCalledWith('test@example.com', 'Test User', 'payment_123');
    expect(mockSendInvoiceEmail).toHaveBeenCalledWith('payment_123', 'test@example.com', 'Test User');
    expect(success).toBe(true);
  });

  it('should handle errors when sending backup emails', async () => {
    mockSendDirectBackupEmail.mockRejectedValueOnce(new Error('Failed to send backup email'));
    
    const { result } = renderHook(() => useBackupProcessing());
    
    const success = await result.current.sendBackupEmails(
      'payment_123',
      'test@example.com',
      'Test User'
    );
    
    expect(success).toBe(false);
  });

  it('should show appropriate verification toast messages', () => {
    const { result } = renderHook(() => useBackupProcessing());
    
    // Test password email sent case
    result.current.showVerificationToasts({ passwordEmailSent: true });
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: 'Account activated!'
    }));
    
    // Reset mock
    mockToast.toast.mockClear();
    
    // Test membership created case
    result.current.showVerificationToasts({ membershipCreated: true });
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: 'Membership activated!'
    }));
    
    // Reset mock
    mockToast.toast.mockClear();
    
    // Test simplified verification case
    result.current.showVerificationToasts({ simplifiedVerification: true });
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: 'Membership confirmed!'
    }));
    
    // Reset mock
    mockToast.toast.mockClear();
    
    // Test default case
    result.current.showVerificationToasts({});
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: 'Payment successful!'
    }));
  });
});
