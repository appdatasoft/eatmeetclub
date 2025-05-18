
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import MenuSelectionFooter from '../MenuSelectionFooter';

describe('MenuSelectionFooter', () => {
  const mockProps = {
    selectedCount: 2,
    saving: false,
    onCancel: vi.fn(),
    onSave: vi.fn(),
  };

  it('renders the footer with correct selected count', () => {
    render(<MenuSelectionFooter {...mockProps} />);
    expect(screen.getByText(/2 items selected/i)).toBeInTheDocument();
  });

  it('renders singular text when only one item is selected', () => {
    render(<MenuSelectionFooter {...mockProps} selectedCount={1} />);
    expect(screen.getByText(/1 item selected/i)).toBeInTheDocument();
  });

  it('renders zero text when no items are selected', () => {
    render(<MenuSelectionFooter {...mockProps} selectedCount={0} />);
    expect(screen.getByText(/No items selected/i)).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', () => {
    render(<MenuSelectionFooter {...mockProps} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(mockProps.onSave).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<MenuSelectionFooter {...mockProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('disables the save button and shows loading state when saving', () => {
    render(<MenuSelectionFooter {...mockProps} saving={true} />);
    
    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent(/saving/i);
  });

  it('disables the save button when no items are selected', () => {
    render(<MenuSelectionFooter {...mockProps} selectedCount={0} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });
});
