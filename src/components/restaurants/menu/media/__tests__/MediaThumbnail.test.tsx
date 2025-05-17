
import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaThumbnail from '../MediaThumbnail';
import { MediaItem } from '../../types/mediaTypes';

describe('MediaThumbnail Component', () => {
  const mockImageItem: MediaItem = { 
    id: '1', 
    url: 'https://example.com/image.jpg', 
    type: 'image' 
  };
  
  const mockVideoItem: MediaItem = { 
    id: '2', 
    url: 'https://example.com/video.mp4', 
    type: 'video' 
  };
  
  const mockOnClick = vi.fn();
  const mockOnNavigate = vi.fn();
  
  beforeEach(() => {
    mockOnClick.mockClear();
    mockOnNavigate.mockClear();
  });
  
  it('renders an image thumbnail correctly', () => {
    render(
      <MediaThumbnail 
        item={mockImageItem} 
        onClick={mockOnClick} 
      />
    );
    
    // Should have a button role
    const thumbnailButton = screen.getByRole('button');
    expect(thumbnailButton).toBeInTheDocument();
    
    // Should have the correct aria-label
    expect(screen.getByRole('button', { name: /view image/i })).toBeInTheDocument();
  });
  
  it('renders a video thumbnail correctly', () => {
    render(
      <MediaThumbnail 
        item={mockVideoItem} 
        onClick={mockOnClick} 
      />
    );
    
    // Should have a button role with video label
    expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    render(
      <MediaThumbnail 
        item={mockImageItem} 
        onClick={mockOnClick} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows navigation controls when showNav is true', () => {
    render(
      <MediaThumbnail 
        item={mockImageItem} 
        onClick={mockOnClick}
        data-index={2}
        totalItems={5}
        onNavigate={mockOnNavigate}
        showNav={true}
      />
    );
    
    // Should show item counter
    expect(screen.getByText('3/5')).toBeInTheDocument();
    
    // Should show navigation buttons
    expect(screen.getByRole('button', { name: /previous image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next image/i })).toBeInTheDocument();
  });
  
  it('calls onNavigate when navigation buttons are clicked', () => {
    render(
      <MediaThumbnail 
        item={mockImageItem} 
        onClick={mockOnClick}
        data-index={2}
        totalItems={5}
        onNavigate={mockOnNavigate}
        showNav={true}
      />
    );
    
    // Click prev button
    fireEvent.click(screen.getByRole('button', { name: /previous image/i }));
    expect(mockOnNavigate).toHaveBeenCalledWith('prev');
    
    // Click next button
    fireEvent.click(screen.getByRole('button', { name: /next image/i }));
    expect(mockOnNavigate).toHaveBeenCalledWith('next');
    
    // Main thumbnail click should call onClick, not onNavigate
    fireEvent.click(screen.getByRole('button', { name: /view image/i }));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('handles keyboard navigation', () => {
    render(
      <MediaThumbnail 
        item={mockImageItem} 
        onClick={mockOnClick}
        data-index={2}
        totalItems={5}
        onNavigate={mockOnNavigate}
        showNav={true}
      />
    );
    
    const thumbnail = screen.getByRole('button', { name: /view image/i });
    
    // Enter key should call onClick
    fireEvent.keyDown(thumbnail, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    
    // Space key should call onClick
    fireEvent.keyDown(thumbnail, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
    
    // Arrow left key should call onNavigate with 'prev'
    fireEvent.keyDown(thumbnail, { key: 'ArrowLeft' });
    expect(mockOnNavigate).toHaveBeenCalledWith('prev');
    
    // Arrow right key should call onNavigate with 'next'
    fireEvent.keyDown(thumbnail, { key: 'ArrowRight' });
    expect(mockOnNavigate).toHaveBeenCalledWith('next');
  });
});
