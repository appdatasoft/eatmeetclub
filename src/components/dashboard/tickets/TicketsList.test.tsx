
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TicketsList from './TicketsList';
import { UserTicket } from './types';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('TicketsList', () => {
  const mockTickets: UserTicket[] = [
    {
      id: 'ticket1',
      event_id: 'event1',
      event_title: 'Jazz Night',
      event_date: 'June 15, 2023',
      restaurant_name: 'Blue Note',
      quantity: 2,
      price: 25,
      purchase_date: 'June 1, 2023'
    },
    {
      id: 'ticket2',
      event_id: 'event2',
      event_title: 'Wine Tasting',
      event_date: 'July 20, 2023',
      restaurant_name: 'Vintage Cellar',
      quantity: 1,
      price: 50,
      purchase_date: 'June 10, 2023'
    }
  ];

  it('renders a list of tickets', () => {
    render(<TicketsList tickets={mockTickets} />);
    
    expect(screen.getByText('Jazz Night')).toBeInTheDocument();
    expect(screen.getByText('Blue Note')).toBeInTheDocument();
    expect(screen.getByText('Wine Tasting')).toBeInTheDocument();
    expect(screen.getByText('Vintage Cellar')).toBeInTheDocument();
  });

  it('displays the correct ticket quantity labels', () => {
    render(<TicketsList tickets={mockTickets} />);
    
    const ticketLabels = screen.getAllByText(/ticket/i);
    expect(ticketLabels[0].textContent).toContain('2 tickets');
    expect(ticketLabels[1].textContent).toContain('1 ticket'); // Singular form
  });

  it('renders the correct number of ticket items', () => {
    render(<TicketsList tickets={mockTickets} />);
    
    // Find all ticket items
    const ticketItems = screen.getAllByRole('heading', { level: 3 });
    expect(ticketItems.length).toBe(2);
  });

  it('renders an empty list when no tickets are provided', () => {
    render(<TicketsList tickets={[]} />);
    
    // Should render an empty div with no ticket items
    expect(screen.queryByText(/Jazz Night/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Wine Tasting/i)).not.toBeInTheDocument();
  });
});
