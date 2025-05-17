
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UserTickets from './UserTickets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock the TicketsList component
vi.mock('./TicketsList', () => ({
  default: ({ tickets }) => (
    <div data-testid="tickets-list">
      {tickets.map(ticket => (
        <div key={ticket.id} data-testid="ticket-item">
          {ticket.event_title} - {ticket.quantity} tickets
        </div>
      ))}
    </div>
  )
}));

describe('UserTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: 'user123' } });
  });

  it('should display loading state initially', () => {
    (supabase.from as any).mockReturnThis();
    (supabase.select as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.order as any).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<UserTickets userId="user123" />);
    
    expect(screen.getByText(/Loading your tickets.../i)).toBeInTheDocument();
  });

  it('should display tickets when data is loaded', async () => {
    const mockTickets = [
      {
        id: 'ticket1',
        event_id: 'event1',
        event_title: 'Concert Night',
        event_date: '2023-06-15',
        restaurant_name: 'Jazz Club',
        quantity: 2,
        purchase_date: '2023-06-01'
      },
      {
        id: 'ticket2',
        event_id: 'event2',
        event_title: 'Food Festival',
        event_date: '2023-07-20',
        restaurant_name: 'Central Park',
        quantity: 1,
        purchase_date: '2023-06-10'
      }
    ];

    (supabase.order as any).mockResolvedValue({ 
      data: mockTickets,
      error: null 
    });

    render(<UserTickets userId="user123" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading your tickets.../i)).not.toBeInTheDocument();
      expect(screen.getAllByTestId('ticket-item').length).toBe(2);
      expect(screen.getByText(/Concert Night - 2 tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/Food Festival - 1 tickets/i)).toBeInTheDocument();
    });

    expect(supabase.from).toHaveBeenCalledWith('tickets');
    expect(supabase.eq).toHaveBeenCalledWith('user_id', 'user123');
    expect(supabase.order).toHaveBeenCalledWith('purchase_date', { ascending: false });
  });

  it('should display empty state when no tickets are found', async () => {
    (supabase.order as any).mockResolvedValue({ 
      data: [],
      error: null 
    });

    render(<UserTickets userId="user123" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading your tickets.../i)).not.toBeInTheDocument();
      expect(screen.getByText(/You don't have any tickets yet/i)).toBeInTheDocument();
    });
  });

  it('should display error state when API call fails', async () => {
    (supabase.order as any).mockResolvedValue({ 
      data: null,
      error: { message: 'Failed to fetch tickets' } 
    });

    render(<UserTickets userId="user123" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading your tickets.../i)).not.toBeInTheDocument();
      expect(screen.getByText(/Error loading tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch tickets/i)).toBeInTheDocument();
    });
  });
});
