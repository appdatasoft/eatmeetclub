
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventStatusBadge, { PublishedBadge } from '../EventStatusBadge';

describe('EventStatusBadge', () => {
  it('renders "Paid" badge when payment status is completed', () => {
    render(<EventStatusBadge paymentStatus="completed" />);
    
    const badge = screen.getByText('Paid');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-green-100');
    expect(badge.parentElement).toHaveClass('text-green-800');
  });
  
  it('renders "Payment Required" badge when payment status is not completed', () => {
    render(<EventStatusBadge paymentStatus="pending" />);
    
    const badge = screen.getByText('Payment Required');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-amber-50');
    expect(badge.parentElement).toHaveClass('text-amber-800');
  });
  
  it('applies custom className to the badge', () => {
    render(<EventStatusBadge paymentStatus="completed" className="custom-class" />);
    
    const badge = screen.getByText('Paid');
    expect(badge.parentElement).toHaveClass('custom-class');
  });
});

describe('PublishedBadge', () => {
  it('renders "Published" badge', () => {
    render(<PublishedBadge />);
    
    const badge = screen.getByText('Published');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-green-100');
    expect(badge.parentElement).toHaveClass('text-green-800');
  });
  
  it('applies custom className to the badge', () => {
    render(<PublishedBadge className="custom-class" />);
    
    const badge = screen.getByText('Published');
    expect(badge.parentElement).toHaveClass('custom-class');
  });
});
