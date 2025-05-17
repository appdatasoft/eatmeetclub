
import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-setup';
import { describe, it, expect, vi } from 'vitest';
import IngredientsInput from '../IngredientsInput';

describe('IngredientsInput Component', () => {
  const mockOnChange = vi.fn();
  
  it('renders with existing ingredients', () => {
    render(
      <IngredientsInput 
        ingredients={['Salt', 'Pepper', 'Sugar']} 
        onIngredientsChange={mockOnChange} 
      />
    );
    
    // Check if each ingredient is rendered
    expect(screen.getByText('Salt')).toBeInTheDocument();
    expect(screen.getByText('Pepper')).toBeInTheDocument();
    expect(screen.getByText('Sugar')).toBeInTheDocument();
    
    // Check if input field is rendered
    expect(screen.getByPlaceholderText('Add an ingredient')).toBeInTheDocument();
  });

  it('allows adding a new ingredient', () => {
    render(
      <IngredientsInput 
        ingredients={[]} 
        onIngredientsChange={mockOnChange} 
      />
    );
    
    // Type in the input
    const input = screen.getByPlaceholderText('Add an ingredient');
    fireEvent.change(input, { target: { value: 'Flour' } });
    
    // Click the add button
    const addButton = screen.getByRole('button');
    fireEvent.click(addButton);
    
    // Check if onIngredientsChange was called with correct argument
    expect(mockOnChange).toHaveBeenCalledWith(['Flour']);
  });

  it('ignores empty ingredients', () => {
    render(
      <IngredientsInput 
        ingredients={['Salt']} 
        onIngredientsChange={mockOnChange} 
      />
    );
    
    // Type empty string in the input
    const input = screen.getByPlaceholderText('Add an ingredient');
    fireEvent.change(input, { target: { value: '   ' } });
    
    // Click the add button
    const addButton = screen.getByRole('button');
    fireEvent.click(addButton);
    
    // Should not call onIngredientsChange
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('allows removing an ingredient', () => {
    render(
      <IngredientsInput 
        ingredients={['Salt', 'Pepper', 'Sugar']} 
        onIngredientsChange={mockOnChange} 
      />
    );
    
    // Click the remove button for Pepper
    const removeButtons = screen.getAllByRole('button');
    // Find the button next to 'Pepper' text
    const pepperButton = Array.from(removeButtons).find(
      button => {
        const element = button as HTMLElement;
        return element.parentElement?.textContent?.includes('Pepper');
      }
    );
    
    if (pepperButton) {
      fireEvent.click(pepperButton);
      
      // Check if onIngredientsChange was called with correct array
      expect(mockOnChange).toHaveBeenCalledWith(['Salt', 'Sugar']);
    } else {
      throw new Error('Pepper remove button not found');
    }
  });
});
