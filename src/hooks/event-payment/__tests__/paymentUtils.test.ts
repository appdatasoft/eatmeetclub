
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyPaymentStatus, formatCurrency } from '../paymentUtils';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    },
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('Payment Utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe('verifyPaymentStatus', () => {
    it('should return true when payment verification succeeds', async () => {
      // Mock successful authentication and function call
      (supabase.auth.getSession as any).mockResolvedValue({
        data: {
          session: { access_token: 'test-token' }
        }
      });
      
      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true },
        error: null
      });
      
      const result = await verifyPaymentStatus('test-session-id');
      
      expect(result).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'verify-ticket-payment',
        {
          body: { sessionId: 'test-session-id' },
          headers: { Authorization: 'Bearer test-token' }
        }
      );
    });
    
    it('should return false when user is not authenticated', async () => {
      // Mock no session
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null }
      });
      
      const result = await verifyPaymentStatus('test-session-id');
      
      expect(result).toBe(false);
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });
    
    it('should return false when function call fails', async () => {
      // Mock authentication but failed function call
      (supabase.auth.getSession as any).mockResolvedValue({
        data: {
          session: { access_token: 'test-token' }
        }
      });
      
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: { message: 'Function error' }
      });
      
      const result = await verifyPaymentStatus('test-session-id');
      
      expect(result).toBe(false);
    });
  });
  
  describe('formatCurrency', () => {
    it('should format a number as USD currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(25.5)).toBe('$25.50');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-100)).toBe('-$100.00');
    });
  });
});
