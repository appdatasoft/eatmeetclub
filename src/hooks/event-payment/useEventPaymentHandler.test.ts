
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useEventPaymentHandler } from './useEventPaymentHandler';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EventDetails } from '@/types/event';

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

describe('useEventPaymentHandler', () => {
  // Fix the Restaurant type by adding all required properties
  const mockEvent: EventDetails = {
    id: 'event123',
    title: 'Test Event',
    description: 'Test Description',
    price: 25,
    capacity: 100,
    user_id: 'user123',
    published: true,
    restaurant: {
      id: 'rest123', // Add the missing required id property
      name: 'Test Restaurant',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipcode: '12345',
      description: 'Test Description'
    },
    date: '2023-06-15',
    time: '19:00'
  };

  const mockToast = { toast: vi.fn() };
  const mockNavigate = vi.fn();
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
    (useNavigate as any).mockReturnValue(mockNavigate);
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });
    
    // Default mock for successful auth session
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
          user: { id: 'user123', email: 'test@example.com' }
        }
      }
    });
    
    // Default mock for successful Stripe checkout session creation
    (supabase.functions.invoke as any).mockResolvedValue({
      error: null,
      data: { url: 'https://checkout.stripe.com/test-session' }
    });
    
    // Mock location.href
    Object.defineProperty(window, 'location', {
      value: {
        href: ''
      },
      writable: true
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEventPaymentHandler(mockEvent));
    
    expect(result.current.isPaymentProcessing).toBe(false);
    expect(typeof result.current.handleBuyTickets).toBe('function');
  });

  it('should show error toast when event is null', async () => {
    const { result } = renderHook(() => useEventPaymentHandler(null));
    
    await act(async () => {
      await result.current.handleBuyTickets(2);
    });
    
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Event details not available',
      variant: 'destructive'
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

  it('should create a payment session with correct data', async () => {
    const { result } = renderHook(() => useEventPaymentHandler(mockEvent));
    
    await act(async () => {
      await result.current.handleBuyTickets(3);
    });
    
    // Check that the function was called with correct parameters
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'create-ticket-payment',
      expect.objectContaining({
        body: expect.objectContaining({
          purchaseData: expect.objectContaining({
            eventId: mockEvent.id,
            quantity: 3,
            unitPrice: mockEvent.price,
            serviceFee: mockEvent.price * 3 * 0.05,
            totalAmount: mockEvent.price * 3 * 1.05
          })
        }),
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
    
    // Check that ticket details were stored
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'ticketDetails',
      expect.stringContaining(mockEvent.id)
    );
    
    // Check that redirection happened
    expect(window.location.href).toBe('https://checkout.stripe.com/test-session');
  });

  it('should handle errors from payment session creation', async () => {
    // Mock an error response
    (supabase.functions.invoke as any).mockResolvedValue({
      error: { message: 'Failed to create payment session' }
    });
    
    const { result } = renderHook(() => useEventPaymentHandler(mockEvent));
    
    await act(async () => {
      await result.current.handleBuyTickets(1);
    });
    
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to create payment session',
      variant: 'destructive'
    });
    expect(result.current.isPaymentProcessing).toBe(false);
  });

  it('should handle missing checkout URL', async () => {
    // Mock response with no URL
    (supabase.functions.invoke as any).mockResolvedValue({
      error: null,
      data: {}
    });
    
    const { result } = renderHook(() => useEventPaymentHandler(mockEvent));
    
    await act(async () => {
      await result.current.handleBuyTickets(1);
    });
    
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'No checkout URL returned from payment service',
      variant: 'destructive'
    });
    expect(result.current.isPaymentProcessing).toBe(false);
  });
});
