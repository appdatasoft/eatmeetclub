
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RestaurantMenu from '../RestaurantMenu';
import { BrowserRouter } from 'react-router-dom';

// Mock the components and hooks used in RestaurantMenu
vi.mock('@/components/events/RestaurantMenuPreview', () => ({
  default: () => <div data-testid="menu-preview">Menu Preview</div>
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-123' } })
}));

describe('RestaurantMenu', () => {
  it('renders restaurant menu section', () => {
    render(
      <BrowserRouter>
        <RestaurantMenu 
          restaurantId="123" 
          restaurantName="Test Restaurant" 
          isOwner={false} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Restaurant Menu')).toBeInTheDocument();
    expect(screen.getByTestId('menu-preview')).toBeInTheDocument();
  });
  
  it('does not show manage menu button when not owner', () => {
    render(
      <BrowserRouter>
        <RestaurantMenu 
          restaurantId="123" 
          restaurantName="Test Restaurant" 
          isOwner={false} 
        />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Manage Menu')).not.toBeInTheDocument();
  });
  
  it('shows manage menu button when user is owner', () => {
    render(
      <BrowserRouter>
        <RestaurantMenu 
          restaurantId="123" 
          restaurantName="Test Restaurant" 
          isOwner={true}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Manage Menu')).toBeInTheDocument();
  });
});
