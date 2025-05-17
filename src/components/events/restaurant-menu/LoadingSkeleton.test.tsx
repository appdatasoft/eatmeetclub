
import React from 'react';
import { render, screen } from '@/lib/test-setup';
import { describe, it, expect } from 'vitest';
import LoadingSkeleton from './LoadingSkeleton';

describe('LoadingSkeleton Component', () => {
  it('renders skeleton loading elements', () => {
    render(<LoadingSkeleton />);
    
    // Check that skeleton elements are rendered
    const skeletonElements = screen.getAllByTestId('loading-skeleton-item');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});
