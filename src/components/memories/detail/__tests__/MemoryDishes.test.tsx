
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MemoryDishes from '../MemoryDishes';
import { MemoryDish } from '@/types/memory';

describe('MemoryDishes', () => {
  it('renders dishes when provided', () => {
    const dishes: MemoryDish[] = [
      { id: '1', dish_name: 'Pasta', memory_id: 'mem1', user_id: 'user1', created_at: '2023-01-01' },
      { id: '2', dish_name: 'Pizza', memory_id: 'mem1', user_id: 'user1', created_at: '2023-01-01' },
    ];
    
    render(<MemoryDishes dishes={dishes} />);
    
    expect(screen.getByText('Favorite Dishes')).toBeInTheDocument();
    expect(screen.getByText('Pasta')).toBeInTheDocument();
    expect(screen.getByText('Pizza')).toBeInTheDocument();
  });
  
  it('renders nothing when dishes array is empty', () => {
    render(<MemoryDishes dishes={[]} />);
    expect(screen.queryByText('Favorite Dishes')).not.toBeInTheDocument();
  });
  
  it('renders nothing when dishes are undefined', () => {
    render(<MemoryDishes dishes={undefined} />);
    expect(screen.queryByText('Favorite Dishes')).not.toBeInTheDocument();
  });
});
