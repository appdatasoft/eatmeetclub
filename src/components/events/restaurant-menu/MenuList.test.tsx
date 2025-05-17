
import React from 'react';
import { render, screen } from '@/lib/test-setup';
import { describe, it, expect, vi } from 'vitest';
import MenuList from './MenuList';
import { MenuItem } from './types';

describe('MenuList Component', () => {
  const mockMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Pizza Margherita',
      description: 'Classic pizza with tomato and mozzarella',
      price: 12.99,
      type: 'Main Course',
      restaurant_id: 'restaurant-1',
      ingredients: ['Tomato', 'Mozzarella', 'Basil'],
      media: [{ id: 'img1', url: 'https://example.com/pizza.jpg', type: 'image' }]
    },
    {
      id: '2',
      name: 'Tiramisu',
      description: 'Classic Italian dessert',
      price: 6.99,
      type: 'Dessert',
      restaurant_id: 'restaurant-1',
      ingredients: ['Coffee', 'Mascarpone', 'Cocoa'],
      media: []
    }
  ];

  it('renders menu items grouped by type', () => {
    render(<MenuList menuItems={mockMenuItems} />);
    
    // Check that types are rendered as headings
    expect(screen.getByText('Main Course')).toBeInTheDocument();
    expect(screen.getByText('Dessert')).toBeInTheDocument();
    
    // Check that item names are displayed
    expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
    expect(screen.getByText('Tiramisu')).toBeInTheDocument();
    
    // Check that prices are displayed correctly
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('$6.99')).toBeInTheDocument();
  });

  it('renders empty list when no menu items provided', () => {
    render(<MenuList menuItems={[]} />);
    
    // Should show no items message
    expect(screen.getByText(/No menu items available/i)).toBeInTheDocument();
  });
});
