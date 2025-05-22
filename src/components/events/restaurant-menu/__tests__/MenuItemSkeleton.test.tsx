
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MenuItemSkeleton from '../MenuItemSkeleton';

describe('MenuItemSkeleton', () => {
  it('renders the skeleton structure correctly', () => {
    const { container } = render(<MenuItemSkeleton />);
    
    // Check if the main container has border-b class
    const skeletonContainer = container.firstChild as HTMLElement;
    expect(skeletonContainer).toHaveClass('border-b');
    
    // Check if thumbnail skeleton is rendered
    const thumbnailSkeleton = container.querySelector('.w-16.h-16.bg-gray-200.rounded-md');
    expect(thumbnailSkeleton).toBeInTheDocument();
    
    // Check if content skeleton has multiple gray bars
    const contentSkeletons = container.querySelectorAll('.bg-gray-200.rounded');
    expect(contentSkeletons.length).toBeGreaterThan(2);
    
    // Check if we have a flex layout
    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toBeInTheDocument();
  });
  
  it('renders with the correct structure for menu item representation', () => {
    const { container } = render(<MenuItemSkeleton />);
    
    // Check for name skeleton
    const nameSkeleton = container.querySelector('.h-4.w-1\\/4');
    expect(nameSkeleton).toBeInTheDocument();
    
    // Check for price skeleton
    const priceSkeleton = container.querySelector('.h-4.w-16');
    expect(priceSkeleton).toBeInTheDocument();
    
    // Check for description skeleton
    const descriptionSkeleton = container.querySelector('.h-3.w-3\\/4');
    expect(descriptionSkeleton).toBeInTheDocument();
  });
});
