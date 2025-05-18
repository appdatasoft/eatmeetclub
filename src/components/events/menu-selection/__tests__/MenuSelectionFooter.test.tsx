
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuSelectionFooter from '../MenuSelectionFooter';

describe('MenuSelectionFooter', () => {
  const mockProps = {
    selectedCount: 0,
    saving: false,
    onCancel: vi.fn(),
    onSave: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders with zero items selected', () => {
    render(<MenuSelectionFooter {...mockProps} />);
    
    expect(screen.getByText('0 items selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save selections/i })).toBeInTheDocument();
  });
  
  it('renders with one item selected (singular form)', () => {
    render(<MenuSelectionFooter {...mockProps} selectedCount={1} />);
    
    expect(screen.getByText('1 item selected')).toBeInTheDocument();
  });
  
  it('renders with multiple items selected (plural form)', () => {
    render(<MenuSelectionFooter {...mockProps} selectedCount={3} />);
    
    expect(screen.getByText('3 items selected')).toBeInTheDocument();
  });
  
  it('shows loading spinner when saving', () => {
    render(<MenuSelectionFooter {...mockProps} saving={true} />);
    
    // Check for loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save selections/i })).toBeDisabled();
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    render(<MenuSelectionFooter {...mockProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });
  
  it('calls onSave when save button is clicked', () => {
    render(<MenuSelectionFooter {...mockProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /save selections/i }));
    
    expect(mockProps.onSave).toHaveBeenCalledTimes(1);
  });
  
  it('disables save button when saving', () => {
    render(<MenuSelectionFooter {...mockProps} saving={true} />);
    
    expect(screen.getByRole('button', { name: /save selections/i })).toBeDisabled();
  });
});
