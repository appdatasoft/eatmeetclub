
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import MenuItemsList from '../MenuItemsList';

describe('MenuItemsList', () => {
  const mockMenuItems = [
    { id: 'item-1', name: 'Pizza', description: 'Cheese pizza', price: 12.99 },
    { id: 'item-2', name: 'Burger', description: 'Beef burger', price: 8.99 },
    { id: 'item-3', name: 'Salad', description: null, price: 6.99 },
  ];

  const mockProps = {
    menuItems: mockMenuItems,
    selectedItems: ['item-1'],
    loading: false,
    onToggleItem: vi.fn(),
  };

  it('renders loading skeleton when loading is true', () => {
    render(<MenuItemsList {...mockProps} loading={true} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders empty state when no menu items are available', () => {
    render(<MenuItemsList {...mockProps} menuItems={[]} />);
    expect(screen.getByText(/No menu items available/i)).toBeInTheDocument();
  });

  it('renders all menu items', () => {
    render(<MenuItemsList {...mockProps} />);
    
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Salad')).toBeInTheDocument();
    
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('$8.99')).toBeInTheDocument();
    expect(screen.getByText('$6.99')).toBeInTheDocument();
  });

  it('displays description when available', () => {
    render(<MenuItemsList {...mockProps} />);
    
    expect(screen.getByText('Cheese pizza')).toBeInTheDocument();
    expect(screen.getByText('Beef burger')).toBeInTheDocument();
  });

  it('shows selected items as checked', () => {
    render(<MenuItemsList {...mockProps} />);
    
    // Find all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    
    // The first item should be checked (Pizza with id 'item-1')
    expect(checkboxes[0]).toBeChecked();
    
    // The other items should not be checked
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('calls onToggleItem when an item is clicked', () => {
    render(<MenuItemsList {...mockProps} />);
    
    // Click the second item (Burger)
    fireEvent.click(screen.getByText('Burger'));
    
    // Check that onToggleItem was called with the correct ID
    expect(mockProps.onToggleItem).toHaveBeenCalledWith('item-2');
  });

  it('calls onToggleItem when checkbox is clicked', () => {
    render(<MenuItemsList {...mockProps} />);
    
    // Click the checkbox for the second item
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    
    // Check that onToggleItem was called with the correct ID
    expect(mockProps.onToggleItem).toHaveBeenCalledWith('item-2');
  });
});
