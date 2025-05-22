
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuHeader from '../MenuHeader';

// Mock useSearchParams
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [
    {
      get: (param: string) => {
        if (param === 'eventId') return '123';
        if (param === 'eventName') return 'Test Event';
        return null;
      }
    }
  ]
}));

describe('MenuHeader', () => {
  it('renders restaurant name in the title', () => {
    const handleAddItem = vi.fn();
    render(<MenuHeader restaurantName="Test Restaurant" handleAddItem={handleAddItem} />);
    
    expect(screen.getByText('Test Restaurant Menu')).toBeInTheDocument();
  });
  
  it('displays event name when provided in search params', () => {
    const handleAddItem = vi.fn();
    render(<MenuHeader restaurantName="Test Restaurant" handleAddItem={handleAddItem} />);
    
    expect(screen.getByText(/Managing menu for event:/)).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
  
  it('calls handleAddItem when button is clicked', () => {
    const handleAddItem = vi.fn();
    render(<MenuHeader restaurantName="Test Restaurant" handleAddItem={handleAddItem} />);
    
    fireEvent.click(screen.getByText('Add Menu Item'));
    expect(handleAddItem).toHaveBeenCalledTimes(1);
  });
  
  it('shows alert message for event-specific menu', () => {
    const handleAddItem = vi.fn();
    render(<MenuHeader restaurantName="Test Restaurant" handleAddItem={handleAddItem} />);
    
    expect(screen.getByText(/Any changes you make to this menu will be specific to this event./)).toBeInTheDocument();
  });
});
