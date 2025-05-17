
import { renderHook } from '@testing-library/react-hooks';
import { useCheckoutSession } from './useCheckoutSession';
import { useInvoiceEmail } from './useInvoiceEmail';
import { useToast } from '@/hooks/use-toast';
import { useStripeMode } from './useStripeMode';

// Mock dependencies
jest.mock('./useInvoiceEmail', () => ({
  useInvoiceEmail: jest.fn()
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn()
}));

jest.mock('./useStripeMode', () => ({
  useStripeMode: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();
global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

describe('useCheckoutSession', () => {
  const mockToast = { toast: jest.fn() };
  const mockCheckActiveMembership = jest.fn();
  const mockStripeMode = { mode: 'test' };
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useInvoiceEmail as jest.Mock).mockReturnValue({ 
      checkActiveMembership: mockCheckActiveMembership 
    });
    (useStripeMode as jest.Mock).mockReturnValue(mockStripeMode);
    window.location.href = '';
  });

  it('should return createCheckoutSession function', () => {
    const { result } = renderHook(() => useCheckoutSession());
    
    expect(typeof result.current.createCheckoutSession).toBe('function');
  });

  it('should check for active membership before creating checkout', async () => {
    mockCheckActiveMembership.mockResolvedValueOnce(null);
    
    const mockResponse = {
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValueOnce(JSON.stringify({ success: true, url: 'https://stripe.com/checkout' }))
    };
    
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const response = await result.current.createCheckoutSession('test@example.com', 'Test User', '123456', '123 Test St', {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true
    });
    
    expect(mockCheckActiveMembership).toHaveBeenCalledWith('test@example.com');
    expect(mockFetch).toHaveBeenCalled();
    expect(response.success).toBe(true);
    expect(response.url).toBe('https://stripe.com/checkout');
    expect(window.location.href).toBe('https://stripe.com/checkout');
  });

  it('should redirect to login if active membership already exists', async () => {
    // Mock that user has active membership
    mockCheckActiveMembership.mockResolvedValueOnce({ 
      active: true,
      productInfo: { name: 'Premium' }
    });
    
    global.window.location.href = '';
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const response = await result.current.createCheckoutSession('test@example.com', 'Test User', null, null, {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true
    });
    
    expect(mockCheckActiveMembership).toHaveBeenCalledWith('test@example.com');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: 'Already a Member'
    }));
    expect(window.location.href).toBe('/login');
    expect(response.success).toBe(false);
  });

  it('should handle fetch errors during checkout creation', async () => {
    mockCheckActiveMembership.mockResolvedValueOnce(null);
    
    // Mock fetch error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const response = await result.current.createCheckoutSession('test@example.com', 'Test User', null, null, {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true
    });
    
    expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({ 
      title: 'Error',
      variant: 'destructive'
    }));
    expect(response.success).toBe(false);
    expect(response.error).toBe('Network error');
  });

  it('should handle non-200 response from checkout endpoint', async () => {
    mockCheckActiveMembership.mockResolvedValueOnce(null);
    
    const mockResponse = {
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValueOnce(JSON.stringify({ error: 'Server error' })),
      headers: {
        get: jest.fn().mockReturnValue('application/json')
      }
    };
    
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const response = await result.current.createCheckoutSession('test@example.com', 'Test User', null, null, {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true
    });
    
    expect(response.success).toBe(false);
    expect(response.error).toBe('Server error');
  });

  it('should handle invalid JSON response', async () => {
    mockCheckActiveMembership.mockResolvedValueOnce(null);
    
    const mockResponse = {
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValueOnce('Not a valid JSON'),
      headers: {
        get: jest.fn().mockReturnValue('application/json')
      }
    };
    
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useCheckoutSession());
    
    const response = await result.current.createCheckoutSession('test@example.com', 'Test User', null, null, {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true,
      checkExisting: true
    });
    
    expect(response.success).toBe(false);
    expect(response.error).toContain('Server returned invalid JSON');
  });
});
