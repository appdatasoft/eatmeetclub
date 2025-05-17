
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TicketSuccess from './TicketSuccess';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mocks
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams({ session_id: 'test_session_123' }), vi.fn()],
  useNavigate: () => vi.fn()
}));

// Mock supabase with proper chaining methods
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq });
  
  return {
    supabase: {
      auth: {
        getSession: vi.fn()
      },
      functions: {
        invoke: vi.fn()
      },
      from: mockFrom,
      select: mockSelect,
      eq: mockEq
    }
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('@/components/layout/MainLayout', () => ({
  default: ({ children }) => <div data-testid="main-layout">{children}</div>
}));

describe('TicketSuccess', () => {
  const mockToast = { toast: vi.fn() };
  const mockNavigate = vi.fn();
  
  const mockTicketDetails = {
    event_id: 'event123',
    quantity: 2,
    price: 25,
    service_fee: 2.50,
    total_amount: 52.50
  };
  
  const mockEventDetails = {
    id: 'event123',
    title: 'Test Event',
    date: '2023-06-15',
    time: '19:00',
    restaurant: {
      name: 'Test Restaurant',
      address: '123 Test St',
      city: 'Test City'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
    
    // Mock localStorage
    Storage.prototype.getItem = vi.fn((key) => {
      if (key === 'ticketDetails') {
        return JSON.stringify(mockTicketDetails);
      }
      return null;
    });
    
    Storage.prototype.removeItem = vi.fn();
    
    // Mock successful authentication
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { access_token: 'test-token' } }
    });
    
    // Mock successful payment verification
    (supabase.functions.invoke as any).mockResolvedValue({
      error: null,
      data: { 
        success: true,
        ticket: mockTicketDetails,
        emailSent: true 
      }
    });
    
    // Mock successful event details fetch
    const mockEq = supabase.from("").select("").eq;
    mockEq.mockResolvedValue({
      data: mockEventDetails,
      error: null
    });
  });

  it('shows loading state initially', () => {
    render(<TicketSuccess />);
    
    expect(screen.getByText(/Verifying your payment.../i)).toBeInTheDocument();
  });

  it('verifies payment on mount with session ID from URL', async () => {
    render(<TicketSuccess />);
    
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'verify-ticket-payment',
        expect.objectContaining({
          body: { sessionId: 'test_session_123' }
        })
      );
    });
  });

  it('shows success message and ticket details after verification', async () => {
    render(<TicketSuccess />);
    
    await waitFor(() => {
      expect(screen.getByText(/Thank You For Your Purchase!/i)).toBeInTheDocument();
      expect(screen.getByText(/Your tickets have been purchased successfully./i)).toBeInTheDocument();
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success!'
        })
      );
    });
  });

  it('fetches event details after successful verification', async () => {
    render(<TicketSuccess />);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('events');
      expect(supabase.eq).toHaveBeenCalledWith('id', mockTicketDetails.event_id);
    });
  });

  it('shows notification for invoice email', async () => {
    render(<TicketSuccess />);
    
    await waitFor(() => {
      expect(screen.getByText(/An invoice has been sent to your email/i)).toBeInTheDocument();
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Invoice Email Sent'
        })
      );
    });
  });

  it('provides navigation buttons to view event or browse more events', async () => {
    render(<TicketSuccess />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Event/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Browse More Events/i })).toBeInTheDocument();
    });
  });
});
