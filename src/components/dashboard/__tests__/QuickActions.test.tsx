
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuickActions from '../QuickActions';
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

describe('QuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders quick actions card with title and description', () => {
    render(
      <BrowserRouter>
        <QuickActions />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Common tasks you can perform')).toBeInTheDocument();
  });
  
  it('navigates to create event page when create event button is clicked', () => {
    render(
      <BrowserRouter>
        <QuickActions />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Create New Event'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/create-event');
  });
  
  it('navigates to add restaurant page when add restaurant button is clicked', () => {
    render(
      <BrowserRouter>
        <QuickActions />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Add New Restaurant'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/add-restaurant');
  });
});
