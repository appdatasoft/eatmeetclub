
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PaymentSummary from '../PaymentSummary';

describe('PaymentSummary', () => {
  it('renders membership fee correctly', () => {
    render(<PaymentSummary membershipFee={10} />);
    
    expect(screen.getByText('Monthly Membership')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
  
  it('shows "Billed monthly" text when isSubscription is true', () => {
    render(<PaymentSummary membershipFee={10} isSubscription={true} />);
    
    expect(screen.getByText('Billed monthly')).toBeInTheDocument();
  });
  
  it('does not show "Billed monthly" text when isSubscription is false', () => {
    render(<PaymentSummary membershipFee={10} isSubscription={false} />);
    
    expect(screen.queryByText('Billed monthly')).not.toBeInTheDocument();
  });
  
  it('displays the same amount for fee and total', () => {
    render(<PaymentSummary membershipFee={25} />);
    
    expect(screen.getAllByText('$25.00').length).toBe(2);
  });
});
