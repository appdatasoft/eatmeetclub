
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RestaurantSelector from '../RestaurantSelector';

// Mock Select component from Shadcn UI
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div>
      <select data-testid="select" value={value} onChange={(e) => onValueChange(e.target.value)}>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

describe('RestaurantSelector', () => {
  const restaurants = [
    { id: '1', name: 'Restaurant 1' },
    { id: '2', name: 'Restaurant 2' }
  ];
  
  const onAddRestaurant = vi.fn();
  const setSelectedRestaurantId = vi.fn();
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders select dropdown when restaurants array is not empty', () => {
    render(
      <RestaurantSelector
        restaurants={restaurants}
        selectedRestaurantId="1"
        setSelectedRestaurantId={setSelectedRestaurantId}
        onAddRestaurant={onAddRestaurant}
      />
    );
    
    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByText('Restaurant 1')).toBeInTheDocument();
    expect(screen.getByText('Restaurant 2')).toBeInTheDocument();
  });
  
  it('renders add restaurant prompt when restaurants array is empty', () => {
    render(
      <RestaurantSelector
        restaurants={[]}
        selectedRestaurantId=""
        setSelectedRestaurantId={setSelectedRestaurantId}
        onAddRestaurant={onAddRestaurant}
      />
    );
    
    expect(screen.queryByTestId('select')).not.toBeInTheDocument();
    expect(screen.getByText("You don't have any restaurants yet.")).toBeInTheDocument();
    expect(screen.getByText("Add a Restaurant First")).toBeInTheDocument();
  });
  
  it('calls onAddRestaurant when add restaurant button is clicked', () => {
    render(
      <RestaurantSelector
        restaurants={[]}
        selectedRestaurantId=""
        setSelectedRestaurantId={setSelectedRestaurantId}
        onAddRestaurant={onAddRestaurant}
      />
    );
    
    fireEvent.click(screen.getByText("Add a Restaurant First"));
    expect(onAddRestaurant).toHaveBeenCalledTimes(1);
  });
});
