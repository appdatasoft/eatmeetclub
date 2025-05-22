
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ItemDetails from '../ItemDetails';

describe('ItemDetails', () => {
  const baseItem = {
    id: '1',
    name: 'Test Item',
    price: 12.99,
    type: 'Entree',
    description: 'Test description',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
  };
  
  it('renders item name and price', () => {
    render(<ItemDetails item={baseItem} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
  });
  
  it('renders item description when available', () => {
    render(<ItemDetails item={baseItem} />);
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
  
  it('renders ingredients when available', () => {
    render(<ItemDetails item={baseItem} />);
    
    expect(screen.getByText('Ingredient 1, Ingredient 2')).toBeInTheDocument();
  });
  
  it('does not show photo count button with single media', () => {
    const itemWithOneImage = {
      ...baseItem,
      media: ['image1.jpg']
    };
    
    const onOpenGallery = vi.fn();
    render(<ItemDetails item={itemWithOneImage} onOpenGallery={onOpenGallery} />);
    
    expect(screen.queryByText('1 photos')).not.toBeInTheDocument();
  });
  
  it('shows photo count button with multiple media', () => {
    const itemWithMultipleImages = {
      ...baseItem,
      media: ['image1.jpg', 'image2.jpg', 'image3.jpg']
    };
    
    const onOpenGallery = vi.fn();
    render(<ItemDetails item={itemWithMultipleImages} onOpenGallery={onOpenGallery} />);
    
    expect(screen.getByText('3 photos')).toBeInTheDocument();
  });
  
  it('calls onOpenGallery when photo count button is clicked', () => {
    const itemWithMultipleImages = {
      ...baseItem,
      media: ['image1.jpg', 'image2.jpg']
    };
    
    const onOpenGallery = vi.fn();
    render(<ItemDetails item={itemWithMultipleImages} onOpenGallery={onOpenGallery} />);
    
    fireEvent.click(screen.getByText('2 photos'));
    expect(onOpenGallery).toHaveBeenCalledTimes(1);
  });
});
