
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventPayments } from '../useEventPayments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
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

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('useEventPayments hook', () => {
  const mockToast = vi.fn();
  const mockNavigate = vi.fn();
  const mockEvent = {
    id: 'event-123',
    title: 'Test Event',
    price: 25,
    capacity: 100
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Configure mocks
    (useToast as any).mockReturnValue({ toast: mockToast });
    (useNavigate as any).mockReturnValue(mockNavigate);
    
    // Mock localStorage
    Storage.prototype.setItem = vi.fn();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });
  
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useEventPayments());
    
    expect(result.current.isPaymentProcessing).toBe(false);
    expect(typeof result.current.handleBuyTickets).toBe('function');
  });
  
  it('should redirect unauthenticated users to login', async () => {
    // Mock unauthenticated session
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: null } 
    });
    
    const { result } = renderHook(() => useEventPayments());
    
    await act(async () => {
      await result.current.handleBuyTickets(mockEvent, 2);
    });
    
    // Should show toast message
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Authentication Required"
    }));
    
    // Should save redirect path
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'redirectAfterLogin', 
      `/event/${mockEvent.id}`
    );
    
    // Should redirect to login
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    
    // Should not call any Supabase functions
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });
  
  it('should create payment session for authenticated users', async () => {
    // Mock authenticated session
    const mockToken = 'mock-auth-token';
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: { access_token: mockToken } } 
    });
    
    // Mock successful payment session creation
    const mockCheckoutUrl = 'https://stripe.com/checkout/test';
    (supabase.functions.invoke as any).mockResolvedValue({ 
      data: { url: mockCheckoutUrl },
      error: null
    });
    
    const { result } = renderHook(() => useEventPayments());
    
    await act(async () => {
      await result.current.handleBuyTickets(mockEvent, 2);
    });
    
    // Should call Supabase function with correct data
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'create-ticket-payment',
      expect.objectContaining({
        body: expect.objectContaining({
          purchaseData: expect.objectContaining({
            eventId: mockEvent.id,
            quantity: 2,
            unitPrice: mockEvent.price
          })
        }),
        headers: {
          Authorization: `Bearer ${mockToken}`
        }
      })
    );
    
    // Should store ticket details in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'ticketDetails',
      expect.any(String)
    );
    
    // Should redirect to checkout URL
    expect(window.location.href).toBe(mockCheckoutUrl);
  });
  
  it('should handle errors from payment session creation', async () => {
    // Mock authenticated session
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: { access_token: 'token' } } 
    });
    
    // Mock error response
    const mockError = { message: 'Payment processing failed' };
    (supabase.functions.invoke as any).mockResolvedValue({ 
      error: mockError,
      data: null
    });
    
    // Mock console.error to avoid test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useEventPayments());
    
    await act(async () => {
      await result.current.handleBuyTickets(mockEvent, 2);
    });
    
    // Should show error toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Error",
      variant: "destructive"
    }));
    
    // Should not redirect
    expect(window.location.href).not.toBe(expect.stringContaining('stripe.com'));
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should handle missing checkout URL', async () => {
    // Mock authenticated session
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: { access_token: 'token' } } 
    });
    
    // Mock response with no URL
    (supabase.functions.invoke as any).mockResolvedValue({ 
      data: { url: null },
      error: null
    });
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useEventPayments());
    
    await act(async () => {
      await result.current.handleBuyTickets(mockEvent, 2);
    });
    
    // Should show error toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Error",
      variant: "destructive"
    }));
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
