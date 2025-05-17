
import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-setup';
import { describe, it, expect, vi } from 'vitest';
import BasicDetails from '../BasicDetails';

describe('BasicDetails Component', () => {
  const mockProps = {
    name: 'Test Food',
    description: 'Test description',
    price: 9.99,
    type: 'Main Course',
    onNameChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onPriceChange: vi.fn(),
    onTypeChange: vi.fn()
  };

  it('renders with provided values', () => {
    render(<BasicDetails {...mockProps} />);
    
    // Check if inputs have correct values
    expect(screen.getByDisplayValue('Test Food')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9.99')).toBeInTheDocument();
    
    // Check if labels are rendered
    expect(screen.getByText('Food Item Name*')).toBeInTheDocument();
    expect(screen.getByText('Type*')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Price*')).toBeInTheDocument();
  });

  it('calls onChange handlers when inputs change', () => {
    render(<BasicDetails {...mockProps} />);
    
    // Test name change
    const nameInput = screen.getByLabelText(/Food Item Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Food Name' } });
    expect(mockProps.onNameChange).toHaveBeenCalled();
    
    // Test description change
    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });
    expect(mockProps.onDescriptionChange).toHaveBeenCalled();
    
    // Test price change
    const priceInput = screen.getByLabelText(/Price/i);
    fireEvent.change(priceInput, { target: { value: '12.99' } });
    expect(mockProps.onPriceChange).toHaveBeenCalled();
  });

  it('renders select with correct options', () => {
    render(<BasicDetails {...mockProps} />);
    
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toBeInTheDocument();
    
    // Since the Select is a complex component from shadcn, we can't easily test all options
    // without more complex testing setup, but we can verify the trigger exists with correct value
    expect(selectTrigger.textContent).toContain('Main Course');
  });
});
