
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MenuSelectionHeader from '../MenuSelectionHeader';

describe('MenuSelectionHeader', () => {
  it('renders the header with title', () => {
    render(<MenuSelectionHeader />);
    
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText(/Select Menu Items/i)).toBeInTheDocument();
  });
  
  it('renders instructions text', () => {
    render(<MenuSelectionHeader />);
    
    const instructionsText = screen.getByText(/Choose the dishes you're interested in/i);
    expect(instructionsText).toBeInTheDocument();
  });

  it('ensures dialog header has appropriate ARIA roles', () => {
    render(<MenuSelectionHeader />);
    
    // DialogHeader should have an appropriate ARIA role
    const header = screen.getByText(/Select Menu Items/i).closest('div');
    expect(header).toHaveAttribute('role', 'presentation');
  });
});
