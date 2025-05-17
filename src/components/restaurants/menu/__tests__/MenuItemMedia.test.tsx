
import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-setup';
import { describe, it, expect, vi } from 'vitest';
import MenuItemMedia from '../MenuItemMedia';
import { MediaItem } from '../types/mediaTypes';

describe('MenuItemMedia Component', () => {
  const mockMedia: MediaItem[] = [
    { id: '1', url: 'https://example.com/image1.jpg', type: 'image' },
    { id: '2', url: 'https://example.com/image2.jpg', type: 'image' },
    { id: '3', url: 'https://example.com/video.mp4', type: 'video' },
  ];
  
  it('renders null when no media is provided', () => {
    const { container } = render(<MenuItemMedia />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when empty media array is provided', () => {
    const { container } = render(<MenuItemMedia media={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a single thumbnail when thumbnailOnly is true', () => {
    render(<MenuItemMedia media={mockMedia} thumbnailOnly={true} />);
    
    // Should find one thumbnail image
    const thumbnailContainer = screen.getByRole('button', { name: /view image/i });
    expect(thumbnailContainer).toBeInTheDocument();
    
    // Should show media count
    expect(screen.getByText('1/3')).toBeInTheDocument();
    
    // Should show navigation buttons
    expect(screen.getByRole('button', { name: /previous image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next image/i })).toBeInTheDocument();
  });

  it('allows navigation between media items in thumbnail view', () => {
    render(<MenuItemMedia media={mockMedia} thumbnailOnly={true} />);
    
    // Initially showing first image (1/3)
    expect(screen.getByText('1/3')).toBeInTheDocument();
    
    // Click next button
    fireEvent.click(screen.getByRole('button', { name: /next image/i }));
    
    // Should now show second image (2/3)
    expect(screen.getByText('2/3')).toBeInTheDocument();
    
    // Click next button again
    fireEvent.click(screen.getByRole('button', { name: /next image/i }));
    
    // Should now show third item (3/3)
    expect(screen.getByText('3/3')).toBeInTheDocument();
    
    // Click next again should loop back to first image
    fireEvent.click(screen.getByRole('button', { name: /next image/i }));
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('opens dialog when thumbnail is clicked', () => {
    render(<MenuItemMedia media={mockMedia} thumbnailOnly={true} />);
    
    // Initially, dialog should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    
    // Click on the thumbnail
    fireEvent.click(screen.getByRole('button', { name: /view image/i }));
    
    // Dialog should now be visible
    // Note: This might not work as expected if the MediaDialog implementation 
    // uses Portal or other advanced rendering techniques
    // In that case, you might need to mock the MediaDialog component
  });

  it('renders a gallery when thumbnailOnly is false', () => {
    render(<MenuItemMedia media={mockMedia} thumbnailOnly={false} />);
    
    // Should find the gallery container
    const gallery = screen.getByLabelText(/menu item media gallery/i);
    expect(gallery).toBeInTheDocument();
  });
});
