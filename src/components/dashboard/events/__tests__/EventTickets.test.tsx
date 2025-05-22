
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventTickets from '../EventTickets';
import { Ticket } from '../types';

describe('EventTickets', () => {
  const tickets: Ticket[] = [
    {
      id: '1',
      user_email: 'user1@example.com',
      quantity: 2,
      purchase_date: '2023-01-01',
      user_id: 'user1',
      payment_status: 'paid',
      total_amount: 50
    },
    {
      id: '2',
      user_email: 'user2@example.com',
      quantity: 1,
      purchase_date: '2023-01-02',
      user_id: 'user2',
      payment_status: 'paid',
      total_amount: 25
    }
  ];
  
  it('renders loading state when isLoading is true', () => {
    render(<EventTickets tickets={[]} isLoading={true} />);
    
    expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
  });
  
  it('renders "No tickets sold yet" message when tickets array is empty', () => {
    render(<EventTickets tickets={[]} isLoading={false} />);
    
    expect(screen.getByText('No tickets sold yet')).toBeInTheDocument();
  });
  
  it('renders ticket information correctly', () => {
    render(<EventTickets tickets={tickets} isLoading={false} />);
    
    expect(screen.getByText('Ticket Purchasers:')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    expect(screen.getByText('2 tickets • 2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('1 ticket • 2023-01-02')).toBeInTheDocument();
  });
  
  it('handles singular/plural ticket text correctly', () => {
    render(<EventTickets tickets={tickets} isLoading={false} />);
    
    expect(screen.getByText('2 tickets • 2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('1 ticket • 2023-01-02')).toBeInTheDocument();  // Note the singular "ticket"
  });
});
