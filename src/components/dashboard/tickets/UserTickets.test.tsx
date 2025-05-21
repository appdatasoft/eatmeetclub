
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UserTickets from '@/components/dashboard/UserTickets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
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

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(({ queryFn }) => {
    // Pass the mock data to tanstack query directly
    return {
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    };
  })
}));

// Global mock data
let mockData;

describe('UserTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: 'user123' } });
    
    // Reset mock data
    mockData = null;
    
    // Setup the mock implementation for supabase.from
    const mockSelectFn = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }));
    
    vi.mocked(supabase.from).mockImplementation(() => ({
      select: mockSelectFn
    }) as any);
  });

  it('should display loading state initially', async () => {
    // Mock the useQuery to return loading state
    vi.mock('@tanstack/react-query', () => ({
      useQuery: () => ({
        isLoading: true,
        data: undefined,
        error: null,
        refetch: vi.fn()
      })
    }));

    render(<UserTickets userId="user123" />);
    
    expect(screen.getByText(/Loading your tickets/i)).toBeInTheDocument();
  });

  it('should display tickets when data is loaded', async () => {
    mockData = [
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

    render(<UserTickets userId="user123" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading your tickets/i)).not.toBeInTheDocument();
      expect(screen.getAllByTestId('ticket-item').length).toBe(2);
      expect(screen.getByText(/Concert Night - 2 tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/Food Festival - 1 tickets/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no tickets are found', async () => {
    mockData = [];

    render(<UserTickets userId="user123" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading your tickets/i)).not.toBeInTheDocument();
      expect(screen.getByText(/You don't have any tickets yet/i)).toBeInTheDocument();
    });
  });

  it('should display error state when API call fails', async () => {
    // Mock the useQuery to return error state
    vi.mock('@tanstack/react-query', () => ({
      useQuery: () => ({
        isLoading: false,
        data: undefined,
        error: { message: 'Failed to fetch tickets' },
        refetch: vi.fn()
      })
    }));

    render(<UserTickets userId="user123" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading your tickets/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Error loading tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch tickets/i)).toBeInTheDocument();
    });
  });
});
