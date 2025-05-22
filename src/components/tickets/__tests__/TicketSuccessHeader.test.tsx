
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TicketSuccessHeader from '../TicketSuccessHeader';

describe('TicketSuccessHeader', () => {
  it('renders success message with check icon', () => {
    render(<TicketSuccessHeader emailSent={true} />);
    
    expect(screen.getByText('Thank You For Your Purchase!')).toBeInTheDocument();
    expect(screen.getByText('Your tickets have been purchased successfully.')).toBeInTheDocument();
    
    // Check for success icon container
    const iconContainer = screen.getByRole('presentation');
    expect(iconContainer).toHaveClass('bg-green-100');
  });
  
  it('shows email confirmation message when emailSent is true', () => {
    render(<TicketSuccessHeader emailSent={true} />);
    
    expect(screen.getByText('An invoice has been sent to your email')).toBeInTheDocument();
  });
  
  it('does not show email confirmation message when emailSent is false', () => {
    render(<TicketSuccessHeader emailSent={false} />);
    
    expect(screen.queryByText('An invoice has been sent to your email')).not.toBeInTheDocument();
  });
});
