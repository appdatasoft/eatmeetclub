
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Spinner } from '../spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('h-8 w-8'); // Default medium size
  });

  it('applies small size classes correctly', () => {
    render(<Spinner size="sm" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4 w-4');
  });

  it('applies large size classes correctly', () => {
    render(<Spinner size="lg" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12 w-12');
  });

  it('accepts and applies custom className', () => {
    render(<Spinner className="text-red-500" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-red-500');
  });
});
