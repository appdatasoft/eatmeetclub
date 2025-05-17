
import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-setup';
import { describe, it, expect, vi } from 'vitest';
import MenuItemForm from './MenuItemForm';
import { MenuItemFormValues } from './types/menuTypes';

// Mock the sub-components to simplify testing
vi.mock('./form/BasicDetails', () => ({
  default: ({ name, description, price, type, onNameChange, onDescriptionChange, onPriceChange, onTypeChange }: any) => (
    <div data-testid="basic-details">
      <input 
        data-testid="name-input" 
        value={name} 
        onChange={e => onNameChange(e)} 
      />
      <textarea 
        data-testid="description-input" 
        value={description} 
        onChange={e => onDescriptionChange(e)} 
      />
      <input 
        data-testid="price-input" 
        type="number" 
        value={price} 
        onChange={e => onPriceChange(e)} 
      />
      <select 
        data-testid="type-select" 
        value={type} 
        onChange={e => onTypeChange(e.target.value)} 
      />
    </div>
  )
}));

vi.mock('./form/IngredientsInput', () => ({
  default: ({ ingredients, onIngredientsChange }: any) => (
    <div data-testid="ingredients-input">
      <ul>
        {ingredients.map((ing: string, i: number) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>
      <button 
        data-testid="add-ingredient" 
        onClick={() => onIngredientsChange([...ingredients, 'New Ingredient'])} 
      />
    </div>
  )
}));

vi.mock('./form/FormActions', () => ({
  default: ({ onCancel, isLoading }: any) => (
    <div data-testid="form-actions">
      {onCancel && <button data-testid="cancel-button" onClick={onCancel} />}
      <button data-testid="submit-button" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}));

vi.mock('./MenuItemMediaUploader', () => ({
  default: ({ initialMediaItems, onChange }: any) => (
    <div data-testid="media-uploader">
      <button 
        data-testid="add-media" 
        onClick={() => onChange([...(initialMediaItems || []), { id: 'test-id', url: 'test.jpg', type: 'image' }])} 
      />
    </div>
  )
}));

describe('MenuItemForm Component', () => {
  const mockSubmit = vi.fn().mockResolvedValue(true);
  const mockCancel = vi.fn();
  
  const initialValues: MenuItemFormValues = {
    id: '123',
    name: 'Test Item',
    description: 'Test description',
    price: 9.99,
    type: 'Main Course',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    media: [{ id: 'image-1', url: 'image.jpg', type: 'image' }]
  };
  
  it('renders with initial values', () => {
    render(
      <MenuItemForm 
        initialValues={initialValues}
        onSubmit={mockSubmit}
        onCancel={mockCancel}
        restaurantId="rest123"
        isLoading={false}
      />
    );
    
    expect(screen.getByTestId('basic-details')).toBeInTheDocument();
    expect(screen.getByTestId('ingredients-input')).toBeInTheDocument();
    expect(screen.getByTestId('media-uploader')).toBeInTheDocument();
    expect(screen.getByTestId('form-actions')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    render(
      <MenuItemForm 
        initialValues={initialValues}
        onSubmit={mockSubmit}
        onCancel={mockCancel}
        restaurantId="rest123"
        isLoading={false}
      />
    );
    
    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Check if onSubmit was called with the initial values
    expect(mockSubmit).toHaveBeenCalledWith({
      id: '123',
      name: 'Test Item',
      description: 'Test description',
      price: 9.99,
      type: 'Main Course',
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      media: [{ id: 'image-1', url: 'image.jpg', type: 'image' }]
    });
  });

  it('initializes with default values when no initialValues provided', () => {
    render(
      <MenuItemForm 
        onSubmit={mockSubmit}
        onCancel={mockCancel}
        restaurantId="rest123"
        isLoading={false}
      />
    );
    
    // Form should be rendered with default values
    expect(screen.getByTestId('basic-details')).toBeInTheDocument();
    expect(screen.getByTestId('ingredients-input')).toBeInTheDocument();
    expect(screen.getByTestId('form-actions')).toBeInTheDocument();
  });
});
