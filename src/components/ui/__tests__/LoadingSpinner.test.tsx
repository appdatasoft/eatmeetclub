
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    const spinner = screen.getByRole('presentation');
    expect(spinner).toHaveClass('h-8 w-8');
  });
  
  it('renders with custom text', () => {
    render(<LoadingSpinner text="Please wait..." />);
    
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });
  
  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByRole('presentation');
    expect(spinner).toHaveClass('h-4 w-4');
  });
  
  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByRole('presentation');
    expect(spinner).toHaveClass('h-12 w-12');
  });
  
  it('renders spinner with correct classes', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('presentation');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('border-t-transparent');
  });
});
