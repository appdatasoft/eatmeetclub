
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuItemsList from '../MenuItemsList';

describe('MenuItemsList', () => {
  const mockMenuItems = [
    { id: 'item-1', name: 'Pizza', description: 'Cheese pizza', price: 12.99 },
    { id: 'item-2', name: 'Burger', description: 'Beef burger', price: 8.99 },
    { id: 'item-3', name: 'Pasta', description: null, price: 10.99 }
  ];
  
  const mockToggleItem = vi.fn();
  
  it('renders loading state correctly', () => {
    render(
      <MenuItemsList
        menuItems={[]}
        selectedItems={[]}
        loading={true}
        onToggleItem={mockToggleItem}
      />
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('renders empty state when no menu items', () => {
    render(
      <MenuItemsList
        menuItems={[]}
        selectedItems={[]}
        loading={false}
        onToggleItem={mockToggleItem}
      />
    );
    
    expect(screen.getByText(/No menu items available/i)).toBeInTheDocument();
  });
  
  it('renders menu items correctly', () => {
    render(
      <MenuItemsList
        menuItems={mockMenuItems}
        selectedItems={[]}
        loading={false}
        onToggleItem={mockToggleItem}
      />
    );
    
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Cheese pizza')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Beef burger')).toBeInTheDocument();
    expect(screen.getByText('$8.99')).toBeInTheDocument();
    
    expect(screen.getByText('Pasta')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
  });
  
  it('shows selected state for selected items', () => {
    render(
      <MenuItemsList
        menuItems={mockMenuItems}
        selectedItems={['item-1']}
        loading={false}
        onToggleItem={mockToggleItem}
      />
    );
    
    // Check for the check icon (would be more robust with test IDs)
    const checkIcons = screen.getAllByTestId('check-icon');
    expect(checkIcons.length).toBe(1);
  });
  
  it('calls onToggleItem when menu item is clicked', () => {
    render(
      <MenuItemsList
        menuItems={mockMenuItems}
        selectedItems={[]}
        loading={false}
        onToggleItem={mockToggleItem}
      />
    );
    
    // Click the first menu item
    const pizzaItem = screen.getByText('Pizza').closest('div[role="button"]');
    fireEvent.click(pizzaItem!);
    
    expect(mockToggleItem).toHaveBeenCalledWith('item-1');
  });
  
  it('handles items with missing descriptions', () => {
    render(
      <MenuItemsList
        menuItems={mockMenuItems}
        selectedItems={[]}
        loading={false}
        onToggleItem={mockToggleItem}
      />
    );
    
    // The pasta item doesn't have a description, but should still render
    expect(screen.getByText('Pasta')).toBeInTheDocument();
  });
});
