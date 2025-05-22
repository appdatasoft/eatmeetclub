
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyMenuState from '../EmptyMenuState';

describe('EmptyMenuState', () => {
  it('renders the empty state message correctly', () => {
    render(<EmptyMenuState />);
    
    // Check for the heading
    expect(screen.getByText('No menu items found')).toBeInTheDocument();
    
    // Check for the description text
    expect(screen.getByText("This restaurant hasn't added any menu items yet.")).toBeInTheDocument();
    
    // Check if the icon is rendered
    const iconElement = document.querySelector('.h-12.w-12');
    expect(iconElement).toBeInTheDocument();
  });
  
  it('has the correct styling', () => {
    const { container } = render(<EmptyMenuState />);
    
    // Check for the container styling
    const emptyStateContainer = container.firstChild as HTMLElement;
    expect(emptyStateContainer).toHaveClass('text-center');
    expect(emptyStateContainer).toHaveClass('border-dashed');
    expect(emptyStateContainer).toHaveClass('rounded-lg');
  });
});
