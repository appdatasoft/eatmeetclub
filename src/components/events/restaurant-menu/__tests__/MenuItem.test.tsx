
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuItemComponent from '../MenuItem';
import { MenuItem } from '../types';

// Mock the ItemDetails and MediaGalleryDialog components
vi.mock('../components/ItemDetails', () => ({
  default: ({ item, onOpenGallery }: { item: any; onOpenGallery?: () => void }) => (
    <div data-testid="item-details">
      <h3>{item.name}</h3>
      <button data-testid="open-gallery-button" onClick={onOpenGallery}>Open Gallery</button>
    </div>
  )
}));

vi.mock('../components/MediaGalleryDialog', () => ({
  default: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? (
      <div data-testid="media-gallery-dialog">
        <button data-testid="close-gallery-button" onClick={() => onOpenChange(false)}>
          Close
        </button>
      </div>
    ) : null
  )
}));

describe('MenuItemComponent', () => {
  const mockItem: MenuItem = {
    id: 'item1',
    name: 'Test Food Item',
    price: 12.99,
    restaurant_id: 'rest1',
    media: [
      { id: 'media1', url: 'https://example.com/image1.jpg', type: 'image' }
    ]
  };
  
  it('renders with item details', () => {
    render(<MenuItemComponent item={mockItem} />);
    
    // Check if item name is rendered via mocked ItemDetails
    expect(screen.getByText('Test Food Item')).toBeInTheDocument();
    
    // Check if the thumbnail is rendered
    const thumbnail = document.querySelector('.flex-shrink-0');
    expect(thumbnail).toBeInTheDocument();
  });
  
  it('shows media gallery when thumbnail is clicked', () => {
    render(<MenuItemComponent item={mockItem} />);
    
    // Initially gallery dialog should not be visible
    expect(screen.queryByTestId('media-gallery-dialog')).not.toBeInTheDocument();
    
    // Find and click the thumbnail
    const openGalleryButton = screen.getByTestId('open-gallery-button');
    fireEvent.click(openGalleryButton);
    
    // Now the gallery dialog should be visible
    expect(screen.getByTestId('media-gallery-dialog')).toBeInTheDocument();
  });
  
  it('closes the gallery when close button is clicked', () => {
    render(<MenuItemComponent item={mockItem} />);
    
    // Open the gallery
    fireEvent.click(screen.getByTestId('open-gallery-button'));
    
    // Gallery should be visible
    expect(screen.getByTestId('media-gallery-dialog')).toBeInTheDocument();
    
    // Close the gallery
    fireEvent.click(screen.getByTestId('close-gallery-button'));
    
    // Gallery should no longer be visible
    expect(screen.queryByTestId('media-gallery-dialog')).not.toBeInTheDocument();
  });
  
  it('handles items with no media', () => {
    const itemWithNoMedia = { ...mockItem, media: undefined };
    render(<MenuItemComponent item={itemWithNoMedia} />);
    
    // Check if the "No image" placeholder is rendered
    expect(screen.getByText('No image')).toBeInTheDocument();
    
    // Ensure gallery doesn't open for items without media
    fireEvent.click(screen.getByTestId('open-gallery-button'));
    expect(screen.queryByTestId('media-gallery-dialog')).not.toBeInTheDocument();
  });
});
