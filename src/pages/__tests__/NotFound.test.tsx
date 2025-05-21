
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock useNavigate and useLocation hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/non-existent-route' }),
  };
});

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the 404 page with correct elements', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByText(/The page "\/non-existent-route" you're looking for doesn't exist or has been moved./)).toBeInTheDocument();
    
    // Verify buttons are present
    expect(screen.getByText('Return to home')).toBeInTheDocument();
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });

  it('navigates to home page when return to home button is clicked', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Return to home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates back when go back button is clicked', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Go back'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
