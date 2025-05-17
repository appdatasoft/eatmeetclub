
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketPurchase from './TicketPurchase';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock the react-router-dom's useNavigate
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn()
}));

describe('TicketPurchase', () => {
  const mockOnBuyTickets = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useAuth - user is logged in
    (useAuth as any).mockReturnValue({ user: { id: 'user123' } });
    
    // Set up localStorage mock
    const localStorageMock = (() => {
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

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });
  
  it('renders correctly with ticket information', () => {
    render(
      <TicketPurchase
        price={25}
        ticketsRemaining={10}
        onBuyTickets={mockOnBuyTickets}
        isPaymentProcessing={false}
      />
    );
    
    expect(screen.getByText(/Purchase Tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/\$25\.00\/person/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buy Ticket/i })).toBeInTheDocument();
    expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/Service Fee/i)).toBeInTheDocument();
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
  });
  
  it('calculates correct subtotal, service fee, and total', () => {
    render(
      <TicketPurchase
        price={50}
        ticketsRemaining={5}
        onBuyTickets={mockOnBuyTickets}
        isPaymentProcessing={false}
      />
    );
    
    // With default of 1 ticket
    expect(screen.getByText('$50.00')).toBeInTheDocument(); // Subtotal
    expect(screen.getByText('$2.50')).toBeInTheDocument(); // Service Fee (5%)
    expect(screen.getByText('$52.50')).toBeInTheDocument(); // Total
    
    // Increase ticket count to 2
    const increaseButton = screen.getByRole('button', { name: /\+/i });
    fireEvent.click(increaseButton);
    
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // Updated Subtotal
    expect(screen.getByText('$5.00')).toBeInTheDocument(); // Updated Service Fee
    expect(screen.getByText('$105.00')).toBeInTheDocument(); // Updated Total
  });
  
  it('disables decrease button when ticket count is 1', () => {
    render(
      <TicketPurchase
        price={25}
        ticketsRemaining={10}
        onBuyTickets={mockOnBuyTickets}
        isPaymentProcessing={false}
      />
    );
    
    const decreaseButton = screen.getByRole('button', { name: /−/i });
    expect(decreaseButton).toBeDisabled();
  });
  
  it('disables increase button when ticket count equals ticketsRemaining', () => {
    render(
      <TicketPurchase
        price={25}
        ticketsRemaining={2}
        onBuyTickets={mockOnBuyTickets}
        isPaymentProcessing={false}
      />
    );
    
    const increaseButton = screen.getByRole('button', { name: /\+/i });
    
    // Not disabled initially
    expect(increaseButton).not.toBeDisabled();
    
    // Increase to the limit
    fireEvent.click(increaseButton);
    
    // Now should be disabled
    expect(increaseButton).toBeDisabled();
  });
  
  it('calls onBuyTickets with the correct ticket count when button is clicked', () => {
    render(
      <TicketPurchase
        price={25}
        ticketsRemaining={10}
        onBuyTickets={mockOnBuyTickets}
        isPaymentProcessing={false}
      />
    );
    
    // Increase to 3 tickets
    const increaseButton = screen.getByRole('button', { name: /\+/i });
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    
    // Click buy
    const buyButton = screen.getByRole('button', { name: /Buy Tickets/i });
    fireEvent.click(buyButton);
    
    // Should call handler with count of 3
    expect(mockOnBuyTickets).toHaveBeenCalledWith(3);
    expect(localStorage.removeItem).toHaveBeenCalledWith('pendingTicketPurchase');
  });
  
  it('shows loading state when processing payment', () => {
    render(
      <TicketPurchase
        price={25}
        ticketsRemaining={10}
        onBuyTickets={mockOnBuyTickets}
        isPaymentProcessing={true}
      />
    );
    
    expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
    const buyButton = screen.getByRole('button', { name: /Processing.../i });
    expect(buyButton).toBeDisabled();
    
    // Input elements should be disabled during processing
    const increaseButton = screen.getByRole('button', { name: /\+/i });
    const decreaseButton = screen.getByRole('button', { name: /−/i });
    const inputElement = screen.getByRole('spinbutton');
    
    expect(increaseButton).toBeDisabled();
    expect(decreaseButton).toBeDisabled();
    expect(inputElement).toBeDisabled();
  });
  
  it('displays login button when user is not logged in', () => {
    // Mock user as not logged in
    (useAuth as any).mockReturnValue({ user: null });
    
    render(
      <TicketPurchase
        price={25}
        ticketsRemaining={10}
        onBuyTickets={mockOnBuyTickets}
        isPaymentProcessing={false}
        isLoggedIn={false}
      />
    );
    
    expect(screen.getByRole('button', { name: /Log in to Buy Tickets/i })).toBeInTheDocument();
    expect(screen.getByText(/Not a member\? Join now to buy tickets/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Buy Ticket/i })).not.toBeInTheDocument();
  });
});
