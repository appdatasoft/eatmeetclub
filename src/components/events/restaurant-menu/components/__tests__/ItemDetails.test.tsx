
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ItemDetails from '../ItemDetails';
import { MenuItem, MediaItem } from '@/components/events/restaurant-menu/types';

describe('ItemDetails', () => {
  const baseItem: MenuItem = {
    id: '1',
    name: 'Test Item',
    price: 12.99,
    type: 'Entree',
    description: 'Test description',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    restaurant_id: 'rest1',
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
      media: [{ id: 'img1', url: 'image1.jpg', type: 'image' }] as MediaItem[]
    };
    
    const onOpenGallery = vi.fn();
    render(<ItemDetails item={itemWithOneImage} onOpenGallery={onOpenGallery} />);
    
    expect(screen.queryByText('1 photos')).not.toBeInTheDocument();
  });
  
  it('shows photo count button with multiple media', () => {
    const itemWithMultipleImages = {
      ...baseItem,
      media: [
        { id: 'img1', url: 'image1.jpg', type: 'image' },
        { id: 'img2', url: 'image2.jpg', type: 'image' },
        { id: 'img3', url: 'image3.jpg', type: 'image' }
      ] as MediaItem[]
    };
    
    const onOpenGallery = vi.fn();
    render(<ItemDetails item={itemWithMultipleImages} onOpenGallery={onOpenGallery} />);
    
    expect(screen.getByText('3 photos')).toBeInTheDocument();
  });
  
  it('calls onOpenGallery when photo count button is clicked', () => {
    const itemWithMultipleImages = {
      ...baseItem,
      media: [
        { id: 'img1', url: 'image1.jpg', type: 'image' },
        { id: 'img2', url: 'image2.jpg', type: 'image' }
      ] as MediaItem[]
    };
    
    const onOpenGallery = vi.fn();
    render(<ItemDetails item={itemWithMultipleImages} onOpenGallery={onOpenGallery} />);
    
    fireEvent.click(screen.getByText('2 photos'));
    expect(onOpenGallery).toHaveBeenCalledTimes(1);
  });
});
