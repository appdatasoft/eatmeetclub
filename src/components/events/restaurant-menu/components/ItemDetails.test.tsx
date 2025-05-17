
import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-setup';
import { describe, it, expect, vi } from 'vitest';
import ItemDetails from './ItemDetails';
import { MenuItem } from '../types';

describe('ItemDetails Component', () => {
  const mockItem: MenuItem = {
    id: '1',
    name: 'Deluxe Burger',
    description: 'A juicy burger with all the toppings',
    price: 14.99,
    type: 'Main Course',
    restaurant_id: 'restaurant-1',
    ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Cheese'],
    media: [
      { id: 'img1', url: 'https://example.com/burger1.jpg', type: 'image' },
      { id: 'img2', url: 'https://example.com/burger2.jpg', type: 'image' }
    ]
  };
  
  const mockOpenGallery = vi.fn();
  
  it('renders item name and price', () => {
    render(<ItemDetails item={mockItem} />);
    
    expect(screen.getByText('Deluxe Burger')).toBeInTheDocument();
    expect(screen.getByText('$14.99')).toBeInTheDocument();
  });
  
  it('renders description when available', () => {
    render(<ItemDetails item={mockItem} />);
    
    expect(screen.getByText('A juicy burger with all the toppings')).toBeInTheDocument();
  });
  
  it('renders ingredients list when available', () => {
    render(<ItemDetails item={mockItem} />);
    
    expect(screen.getByText(/Beef Patty, Lettuce, Tomato, Cheese/i)).toBeInTheDocument();
  });
  
  it('shows gallery button when item has multiple images', () => {
    render(<ItemDetails item={mockItem} onOpenGallery={mockOpenGallery} />);
    
    const galleryButton = screen.getByText(/2 photos/i);
    expect(galleryButton).toBeInTheDocument();
    
    fireEvent.click(galleryButton);
    expect(mockOpenGallery).toHaveBeenCalled();
  });
  
  it('does not show gallery button when onOpenGallery is not provided', () => {
    render(<ItemDetails item={mockItem} />);
    
    const galleryButton = screen.queryByText(/2 photos/i);
    expect(galleryButton).not.toBeInTheDocument();
  });
  
  it('handles items without description', () => {
    const itemWithoutDesc = { ...mockItem, description: undefined };
    render(<ItemDetails item={itemWithoutDesc} />);
    
    expect(screen.queryByText('A juicy burger with all the toppings')).not.toBeInTheDocument();
  });
  
  it('handles items without ingredients', () => {
    const itemWithoutIngredients = { ...mockItem, ingredients: undefined };
    render(<ItemDetails item={itemWithoutIngredients} />);
    
    expect(screen.queryByText(/Beef Patty, Lettuce, Tomato, Cheese/i)).not.toBeInTheDocument();
  });
  
  it('handles items without media', () => {
    const itemWithoutMedia = { ...mockItem, media: undefined };
    render(<ItemDetails item={itemWithoutMedia} onOpenGallery={mockOpenGallery} />);
    
    expect(screen.queryByText(/2 photos/i)).not.toBeInTheDocument();
  });
});
