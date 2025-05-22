
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventCapacityPriceInputs from '../EventCapacityPriceInputs';

describe('EventCapacityPriceInputs', () => {
  it('renders capacity and price inputs with labels', () => {
    const handleChange = vi.fn();
    render(
      <EventCapacityPriceInputs
        capacity="50"
        price="25"
        handleChange={handleChange}
      />
    );
    
    expect(screen.getByLabelText('Capacity*')).toBeInTheDocument();
    expect(screen.getByLabelText('Price per Person*')).toBeInTheDocument();
  });
  
  it('renders with provided capacity and price values', () => {
    const handleChange = vi.fn();
    render(
      <EventCapacityPriceInputs
        capacity="50"
        price="25"
        handleChange={handleChange}
      />
    );
    
    const capacityInput = screen.getByLabelText('Capacity*') as HTMLInputElement;
    const priceInput = screen.getByLabelText('Price per Person*') as HTMLInputElement;
    
    expect(capacityInput.value).toBe('50');
    expect(priceInput.value).toBe('25');
  });
  
  it('calls handleChange when capacity input changes', () => {
    const handleChange = vi.fn();
    render(
      <EventCapacityPriceInputs
        capacity="50"
        price="25"
        handleChange={handleChange}
      />
    );
    
    const capacityInput = screen.getByLabelText('Capacity*');
    fireEvent.change(capacityInput, { target: { value: '60' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
  
  it('calls handleChange when price input changes', () => {
    const handleChange = vi.fn();
    render(
      <EventCapacityPriceInputs
        capacity="50"
        price="25"
        handleChange={handleChange}
      />
    );
    
    const priceInput = screen.getByLabelText('Price per Person*');
    fireEvent.change(priceInput, { target: { value: '30' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
  
  it('has correct input attributes for capacity and price', () => {
    const handleChange = vi.fn();
    render(
      <EventCapacityPriceInputs
        capacity="50"
        price="25"
        handleChange={handleChange}
      />
    );
    
    const capacityInput = screen.getByLabelText('Capacity*') as HTMLInputElement;
    expect(capacityInput.type).toBe('number');
    expect(capacityInput.min).toBe('1');
    
    const priceInput = screen.getByLabelText('Price per Person*') as HTMLInputElement;
    expect(priceInput.type).toBe('number');
    expect(priceInput.min).toBe('0');
    expect(priceInput.step).toBe('0.01');
  });
});
