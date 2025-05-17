
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketItem from './TicketItem';
import { UserTicket } from './types';

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('TicketItem', () => {
  const mockTicket: UserTicket = {
    id: 'ticket123',
    event_id: 'event456',
    event_title: 'Summer Music Festival',
    event_date: 'August 15, 2023',
    restaurant_name: 'Central Park',
    quantity: 3,
    price: 75,
    purchase_date: 'May 20, 2023'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ticket information correctly', () => {
    render(<TicketItem ticket={mockTicket} />);
    
    expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
    expect(screen.getByText('Central Park')).toBeInTheDocument();
    expect(screen.getByText('3 tickets')).toBeInTheDocument();
    expect(screen.getByText(/Event date: August 15, 2023/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchased: May 20, 2023/i)).toBeInTheDocument();
  });

  it('renders singular "ticket" text when quantity is 1', () => {
    const singleTicket = { ...mockTicket, quantity: 1 };
    render(<TicketItem ticket={singleTicket} />);
    
    expect(screen.getByText('1 ticket')).toBeInTheDocument();
  });

  it('navigates to event page when clicked', () => {
    render(<TicketItem ticket={mockTicket} />);
    
    const ticketItem = screen.getByRole('heading', { name: 'Summer Music Festival' }).closest('div');
    fireEvent.click(ticketItem!);
    
    expect(mockNavigate).toHaveBeenCalledWith('/event/event456');
  });
});
