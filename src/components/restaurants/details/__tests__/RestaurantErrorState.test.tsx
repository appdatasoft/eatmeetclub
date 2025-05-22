
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RestaurantErrorState from '../RestaurantErrorState';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the component dependencies
vi.mock('@/components/layout/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/layout/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

describe('RestaurantErrorState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders error message and layout components', () => {
    render(
      <BrowserRouter>
        <RestaurantErrorState />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Not Found')).toBeInTheDocument();
    expect(screen.getByText(/The restaurant you're looking for doesn't exist or has been removed./)).toBeInTheDocument();
  });
  
  it('navigates to venues page when browse button is clicked', () => {
    render(
      <BrowserRouter>
        <RestaurantErrorState />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Browse Venues'));
    expect(mockNavigate).toHaveBeenCalledWith('/venues');
  });
  
  it('navigates back when go back button is clicked', () => {
    render(
      <BrowserRouter>
        <RestaurantErrorState />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Go Back'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
