
import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MenuItemCard from '../MenuItemCard';
import { MenuItem, MediaItem } from '@/types/menuItem';

// Mock the MediaDialog component since it might use portals
vi.mock('../media/MediaDialog', () => ({
  default: ({ mediaItem, onClose }) => (
    mediaItem ? (
      <div data-testid="media-dialog" onClick={onClose}>
        Mock Dialog for {mediaItem.url}
      </div>
    ) : null
  )
}));

describe('MenuItemCard Component', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  
  const mockMenuItem: MenuItem = {
    id: '123',
    name: 'Test Item',
    description: 'Test description',
    price: 9.99,
    type: 'Main Course',
    restaurant_id: 'rest-123',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    media: [
      { id: '1', url: 'https://example.com/image1.jpg', media_type: 'image', menu_item_id: '123' },
      { id: '2', url: 'https://example.com/image2.jpg', media_type: 'image', menu_item_id: '123' }
    ]
  };
  
  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });
  
  it('renders item details correctly', () => {
    render(
      <MenuItemCard 
        item={mockMenuItem} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    // Check if basic item details are rendered
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('Ingredients:')).toBeInTheDocument();
    expect(screen.getByText('Ingredient 1')).toBeInTheDocument();
    expect(screen.getByText('Ingredient 2')).toBeInTheDocument();
  });
  
  it('renders media thumbnail when media is available', () => {
    render(
      <MenuItemCard 
        item={mockMenuItem} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    // Media thumbnail should be rendered
    const thumbnailContainer = screen.getByText('1/2');
    expect(thumbnailContainer).toBeInTheDocument();
    
    // Navigation buttons should be rendered
    expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    render(
      <MenuItemCard 
        item={mockMenuItem} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockMenuItem);
  });
  
  it('calls onDelete when delete button is clicked', () => {
    render(
      <MenuItemCard 
        item={mockMenuItem} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockMenuItem.id);
  });
  
  it('renders a fallback when no media is available', () => {
    const itemWithoutMedia = { ...mockMenuItem, media: undefined };
    
    render(
      <MenuItemCard 
        item={itemWithoutMedia} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    // Should show the no-image fallback
    expect(screen.queryByText('1/2')).not.toBeInTheDocument();
  });
  
  it('navigates between media items when navigation buttons are clicked', () => {
    render(
      <MenuItemCard 
        item={mockMenuItem} 
        onEdit={mockOnEdit} 
        onDelete={mockOnDelete} 
      />
    );
    
    // Initially showing first image (1/2)
    expect(screen.getByText('1/2')).toBeInTheDocument();
    
    // Click next button
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Should now show second image (2/2)
    expect(screen.getByText('2/2')).toBeInTheDocument();
    
    // Click next button again should loop back to first image
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });
});
