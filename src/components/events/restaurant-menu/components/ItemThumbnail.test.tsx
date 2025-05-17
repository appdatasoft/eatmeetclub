
import React from 'react';
import { render, screen, fireEvent } from '@/lib/test-setup';
import { describe, it, expect, vi } from 'vitest';
import ItemThumbnail from './ItemThumbnail';
import { MediaItem } from '../types';

describe('ItemThumbnail Component', () => {
  const mockMedia: MediaItem[] = [
    { id: 'img1', url: 'https://example.com/image1.jpg', type: 'image' },
    { id: 'img2', url: 'https://example.com/image2.jpg', type: 'image' },
    { id: 'video1', url: 'https://example.com/video.mp4', type: 'video' }
  ];
  
  const mockOnClick = vi.fn();
  
  it('renders image thumbnail correctly', () => {
    render(<ItemThumbnail media={[mockMedia[0]]} name="Test Item" onClick={mockOnClick} />);
    
    const img = screen.getByAltText('Test Item thumbnail');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image1.jpg');
  });
  
  it('renders video thumbnail with video icon', () => {
    render(<ItemThumbnail media={[mockMedia[2]]} name="Test Item" onClick={mockOnClick} />);
    
    // We expect a film icon for videos
    const filmIcon = screen.getByTestId('video-icon');
    expect(filmIcon).toBeInTheDocument();
  });
  
  it('calls onClick when thumbnail is clicked', () => {
    render(<ItemThumbnail media={[mockMedia[0]]} name="Test Item" onClick={mockOnClick} />);
    
    const thumbnail = screen.getByAltText('Test Item thumbnail');
    fireEvent.click(thumbnail);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows navigation buttons for multiple media items', () => {
    render(<ItemThumbnail media={mockMedia} name="Test Item" onClick={mockOnClick} />);
    
    // Check for navigation buttons
    const prevButton = screen.getByText('Prev');
    const nextButton = screen.getByText('Next');
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    // Check for media count
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });
  
  it('navigates through media items when clicking next/prev buttons', () => {
    render(<ItemThumbnail media={mockMedia} name="Test Item" onClick={mockOnClick} />);
    
    // Initially showing first image (1/3)
    expect(screen.getByText('1/3')).toBeInTheDocument();
    
    // Click next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should now show second image (2/3)
    expect(screen.getByText('2/3')).toBeInTheDocument();
    
    // Click next button again
    fireEvent.click(nextButton);
    
    // Should now show third item (3/3)
    expect(screen.getByText('3/3')).toBeInTheDocument();
    
    // Click next again should loop back to first image
    fireEvent.click(nextButton);
    expect(screen.getByText('1/3')).toBeInTheDocument();
    
    // Test prev button
    const prevButton = screen.getByText('Prev');
    fireEvent.click(prevButton);
    expect(screen.getByText('3/3')).toBeInTheDocument();
  });
  
  it('renders fallback when no media is provided', () => {
    render(<ItemThumbnail media={[]} name="Test Item" onClick={mockOnClick} />);
    
    const fallbackIcon = screen.getByTestId('no-media-icon');
    expect(fallbackIcon).toBeInTheDocument();
  });
});
