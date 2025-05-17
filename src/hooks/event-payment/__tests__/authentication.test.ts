
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useEventPaymentHandler } from '../useEventPaymentHandler';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createMockEvent, createMockLocalStorage } from './test-utils';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

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

describe('useEventPaymentHandler authentication flow', () => {
  const mockEvent = createMockEvent();
  const mockToast = { toast: vi.fn() };
  const mockNavigate = vi.fn();
  const mockLocalStorage = createMockLocalStorage();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
    (useNavigate as any).mockReturnValue(mockNavigate);
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });
    
    // Default mock for successful auth session (will be overridden in specific tests)
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
          user: { id: 'user123', email: 'test@example.com' }
        }
      }
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    // Mock no active session
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null }
    });
    
    const { result } = renderHook(() => useEventPaymentHandler(mockEvent));
    
    await act(async () => {
      await result.current.handleBuyTickets(2);
    });
    
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Authentication Required',
      description: 'Please log in to purchase tickets',
      variant: 'default'
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2); // Redirect and pending purchase
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
