
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBackupEmail } from '@/hooks/membership/useBackupEmail';

// Mock global fetch
global.fetch = vi.fn();

describe('useBackupEmail hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock environment variable
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should validate email data correctly', () => {
    const { result } = renderHook(() => useBackupEmail());
    
    // Test with valid data
    const validResult = result.current.validateEmailData('user@example.com', 'John Doe');
    expect(validResult).toEqual({
      valid: true,
      email: 'user@example.com',
      name: 'John Doe'
    });
    
    // Test with empty name
    const emptyNameResult = result.current.validateEmailData('user@example.com', '');
    expect(emptyNameResult).toEqual({
      valid: true,
      email: 'user@example.com',
      name: 'Member'
    });
    
    // Test with "undefined" name
    const undefinedNameResult = result.current.validateEmailData('user@example.com', 'undefined');
    expect(undefinedNameResult).toEqual({
      valid: true,
      email: 'user@example.com',
      name: 'Member'
    });
    
    // Test with invalid email
    const invalidEmailResult = result.current.validateEmailData('invalid-email', 'John Doe');
    expect(invalidEmailResult).toEqual({
      valid: false,
      email: '',
      name: 'John Doe'
    });
    
    // Test with "undefined" email
    const undefinedEmailResult = result.current.validateEmailData('undefined', 'John Doe');
    expect(undefinedEmailResult).toEqual({
      valid: false,
      email: '',
      name: 'John Doe'
    });
  });

  it('should send direct backup email successfully', async () => {
    // Mock successful fetch response
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true })
    });
    
    const { result } = renderHook(() => useBackupEmail());
    
    const success = await result.current.sendDirectBackupEmail(
      'user@example.com', 
      'John Doe',
      'test-payment-123'
    );
    
    expect(success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/send-custom-email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.stringContaining('user@example.com')
      })
    );
  });

  it('should handle email sending failure', async () => {
    // Mock failed fetch response
    (fetch as any).mockResolvedValueOnce({
      ok: false
    });
    
    const { result } = renderHook(() => useBackupEmail());
    
    const success = await result.current.sendDirectBackupEmail(
      'user@example.com', 
      'John Doe',
      'test-payment-123'
    );
    
    expect(success).toBe(false);
  });

  it('should handle network errors gracefully', async () => {
    // Mock fetch throwing an error
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useBackupEmail());
    
    const success = await result.current.sendDirectBackupEmail(
      'user@example.com', 
      'John Doe',
      'test-payment-123'
    );
    
    expect(success).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      'Error sending direct backup email:', 
      expect.any(Error)
    );
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should not attempt to send email with invalid data', async () => {
    const { result } = renderHook(() => useBackupEmail());
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const success = await result.current.sendDirectBackupEmail(
      'invalid-email', 
      'John Doe',
      'test-payment-123'
    );
    
    expect(success).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Invalid email data for backup email:', 
      expect.objectContaining({
        email: 'invalid-email',
        name: 'John Doe'
      })
    );
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
