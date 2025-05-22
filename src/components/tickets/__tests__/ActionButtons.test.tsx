
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActionButtons from '../ActionButtons';
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

describe('ActionButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders view event and browse more events buttons', () => {
    render(
      <BrowserRouter>
        <ActionButtons eventId="123" />
      </BrowserRouter>
    );
    
    expect(screen.getByText('View Event')).toBeInTheDocument();
    expect(screen.getByText('Browse More Events')).toBeInTheDocument();
  });
  
  it('navigates to event page when view event button is clicked', () => {
    render(
      <BrowserRouter>
        <ActionButtons eventId="123" />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('View Event'));
    expect(mockNavigate).toHaveBeenCalledWith('/event/123');
  });
  
  it('navigates to events page when browse more events button is clicked', () => {
    render(
      <BrowserRouter>
        <ActionButtons eventId="123" />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Browse More Events'));
    expect(mockNavigate).toHaveBeenCalledWith('/events');
  });
  
  it('passes undefined event id without error', () => {
    render(
      <BrowserRouter>
        <ActionButtons />
      </BrowserRouter>
    );
    
    // Should still render buttons
    expect(screen.getByText('View Event')).toBeInTheDocument();
    expect(screen.getByText('Browse More Events')).toBeInTheDocument();
    
    // Will navigate to /event/undefined
    fireEvent.click(screen.getByText('View Event'));
    expect(mockNavigate).toHaveBeenCalledWith('/event/undefined');
  });
});
