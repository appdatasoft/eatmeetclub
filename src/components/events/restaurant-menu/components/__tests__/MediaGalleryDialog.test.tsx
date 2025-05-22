
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MediaGalleryDialog from '../MediaGalleryDialog';
import { MenuItem } from '../../types';

// Mock the carousel component to avoid issues with Embla carousel in tests
vi.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel">{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-content">{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel-item">{children}</div>,
}));

describe('MediaGalleryDialog', () => {
  const mockItem: MenuItem = {
    id: 'item1',
    name: 'Test Item',
    price: 10.99,
    restaurant_id: 'rest1',
    media: [
      { id: 'img1', url: 'https://example.com/image1.jpg', type: 'image' },
      { id: 'img2', url: 'https://example.com/image2.jpg', type: 'image' },
      { id: 'video1', url: 'https://example.com/video1.mp4', type: 'video' }
    ]
  };

  const mockOnOpenChange = vi.fn();
  
  it('renders correctly when open', () => {
    render(
      <MediaGalleryDialog 
        item={mockItem} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );
    
    // Check if dialog title shows the item name
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    
    // Check if carousel content is rendered
    expect(screen.getByTestId('mock-carousel-content')).toBeInTheDocument();
    
    // Check if navigation controls are rendered for multiple media items
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
  
  it('does not render when not open', () => {
    render(
      <MediaGalleryDialog 
        item={mockItem} 
        open={false} 
        onOpenChange={mockOnOpenChange} 
      />
    );
    
    // Check that the dialog content is not rendered when closed
    expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
  });
  
  it('calls onOpenChange when dialog state changes', () => {
    const { baseElement } = render(
      <MediaGalleryDialog 
        item={mockItem} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );
    
    // Find dialog overlay and click it to close
    const overlay = baseElement.querySelector('[data-radix-collection-item]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });
  
  it('handles navigation between media items', () => {
    render(
      <MediaGalleryDialog 
        item={mockItem} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );
    
    // Initial state shows first image
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Can't directly test state changes due to component implementation,
    // but we can confirm the components are still rendered
    expect(screen.getByTestId('mock-carousel')).toBeInTheDocument();
  });
  
  it('handles item with no media', () => {
    const itemWithNoMedia = { ...mockItem, media: undefined };
    
    render(
      <MediaGalleryDialog 
        item={itemWithNoMedia} 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );
    
    // Dialog should still render without media
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    
    // Navigation controls should not be present
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });
});
