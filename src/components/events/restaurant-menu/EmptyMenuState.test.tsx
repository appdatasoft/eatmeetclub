
import React from 'react';
import { render, screen } from '@/lib/test-setup';
import { describe, it, expect } from 'vitest';
import EmptyMenuState from './EmptyMenuState';

describe('EmptyMenuState Component', () => {
  it('renders empty menu message', () => {
    render(<EmptyMenuState />);
    
    // Check that the empty state message is displayed
    expect(screen.getByText(/No menu items available/i)).toBeInTheDocument();
  });
  
  it('renders an icon', () => {
    render(<EmptyMenuState />);
    
    // Check that there is an icon
    const icon = screen.getByTestId('empty-menu-icon');
    expect(icon).toBeInTheDocument();
  });
});
