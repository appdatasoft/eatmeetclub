
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormActions from '../FormActions';

describe('FormActions Component', () => {
  const mockOnCancel = vi.fn();
  
  it('renders save button', () => {
    render(<FormActions isLoading={false} />);
    
    const saveButton = screen.getByRole('button', { name: /save item/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });

  it('renders cancel button when onCancel prop is provided', () => {
    render(<FormActions isLoading={false} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('does not render cancel button when onCancel is not provided', () => {
    render(<FormActions isLoading={false} />);
    
    const cancelButton = screen.queryByRole('button', { name: /cancel/i });
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<FormActions isLoading={false} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables save button when isLoading is true', () => {
    render(<FormActions isLoading={true} />);
    
    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent('Saving...');
  });
});
