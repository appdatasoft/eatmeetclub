
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuSelectionFooter from '../MenuSelectionFooter';

describe('MenuSelectionFooter', () => {
  const mockOnCancel = vi.fn();
  const mockOnSave = vi.fn();
  
  it('renders selected item count correctly for single item', () => {
    render(
      <MenuSelectionFooter 
        selectedCount={1} 
        saving={false} 
        onCancel={mockOnCancel} 
        onSave={mockOnSave} 
      />
    );
    
    expect(screen.getByText('1 item selected')).toBeInTheDocument();
  });
  
  it('renders selected item count correctly for multiple items', () => {
    render(
      <MenuSelectionFooter 
        selectedCount={3} 
        saving={false} 
        onCancel={mockOnCancel} 
        onSave={mockOnSave} 
      />
    );
    
    expect(screen.getByText('3 items selected')).toBeInTheDocument();
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    render(
      <MenuSelectionFooter 
        selectedCount={1} 
        saving={false} 
        onCancel={mockOnCancel} 
        onSave={mockOnSave} 
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
  
  it('calls onSave when save button is clicked', () => {
    render(
      <MenuSelectionFooter 
        selectedCount={1} 
        saving={false} 
        onCancel={mockOnCancel} 
        onSave={mockOnSave} 
      />
    );
    
    fireEvent.click(screen.getByText('Save Selections'));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
  
  it('disables save button when saving', () => {
    render(
      <MenuSelectionFooter 
        selectedCount={1} 
        saving={true} 
        onCancel={mockOnCancel} 
        onSave={mockOnSave} 
      />
    );
    
    const saveButton = screen.getByText('Save Selections');
    expect(saveButton).toBeDisabled();
  });
  
  it('shows loading indicator when saving', () => {
    render(
      <MenuSelectionFooter 
        selectedCount={1} 
        saving={true} 
        onCancel={mockOnCancel} 
        onSave={mockOnSave} 
      />
    );
    
    const loader = screen.getByRole('presentation');
    expect(loader).toHaveClass('animate-spin');
  });
});
