
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventDateTimeInputs from '../EventDateTimeInputs';

describe('EventDateTimeInputs', () => {
  it('renders date and time inputs with labels', () => {
    const handleChange = vi.fn();
    render(
      <EventDateTimeInputs
        eventDate="2023-01-01"
        eventTime="18:00"
        handleChange={handleChange}
      />
    );
    
    expect(screen.getByLabelText('Event Date*')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Time*')).toBeInTheDocument();
  });
  
  it('renders with provided date and time values', () => {
    const handleChange = vi.fn();
    render(
      <EventDateTimeInputs
        eventDate="2023-01-01"
        eventTime="18:00"
        handleChange={handleChange}
      />
    );
    
    const dateInput = screen.getByLabelText('Event Date*') as HTMLInputElement;
    const timeInput = screen.getByLabelText('Event Time*') as HTMLInputElement;
    
    expect(dateInput.value).toBe('2023-01-01');
    expect(timeInput.value).toBe('18:00');
  });
  
  it('calls handleChange when date input changes', () => {
    const handleChange = vi.fn();
    render(
      <EventDateTimeInputs
        eventDate="2023-01-01"
        eventTime="18:00"
        handleChange={handleChange}
      />
    );
    
    const dateInput = screen.getByLabelText('Event Date*');
    fireEvent.change(dateInput, { target: { value: '2023-02-01' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
  
  it('calls handleChange when time input changes', () => {
    const handleChange = vi.fn();
    render(
      <EventDateTimeInputs
        eventDate="2023-01-01"
        eventTime="18:00"
        handleChange={handleChange}
      />
    );
    
    const timeInput = screen.getByLabelText('Event Time*');
    fireEvent.change(timeInput, { target: { value: '19:00' } });
    
    expect(handleChange).toHaveBeenCalled();
  });
  
  it('handles empty date value correctly', () => {
    const handleChange = vi.fn();
    render(
      <EventDateTimeInputs
        eventDate=""
        eventTime="18:00"
        handleChange={handleChange}
      />
    );
    
    const dateInput = screen.getByLabelText('Event Date*') as HTMLInputElement;
    expect(dateInput.value).toBe('');
  });
});
