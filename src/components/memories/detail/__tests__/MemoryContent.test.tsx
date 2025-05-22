
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MemoryContent from '../MemoryContent';

describe('MemoryContent', () => {
  it('renders image when photoUrl is provided', () => {
    const photoUrl = 'https://example.com/photo.jpg';
    const title = 'Test Memory';
    
    render(<MemoryContent photoUrl={photoUrl} title={title} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', photoUrl);
    expect(image).toHaveAttribute('alt', title);
  });
  
  it('renders placeholder when photoUrl is not provided', () => {
    const title = 'Test Memory';
    
    render(<MemoryContent photoUrl={null} title={title} />);
    
    expect(screen.getByText('No image')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
