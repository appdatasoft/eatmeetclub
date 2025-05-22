
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MemoryDeleteDialog from '../MemoryDeleteDialog';

describe('MemoryDeleteDialog', () => {
  it('renders dialog when open', () => {
    const onOpenChange = vi.fn();
    const onDelete = vi.fn();
    
    render(
      <MemoryDeleteDialog
        isOpen={true}
        onOpenChange={onOpenChange}
        onDelete={onDelete}
      />
    );
    
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });
  
  it('calls onDelete when delete button is clicked', () => {
    const onOpenChange = vi.fn();
    const onDelete = vi.fn();
    
    render(
      <MemoryDeleteDialog
        isOpen={true}
        onOpenChange={onOpenChange}
        onDelete={onDelete}
      />
    );
    
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
  
  it('calls onOpenChange when cancel button is clicked', () => {
    const onOpenChange = vi.fn();
    const onDelete = vi.fn();
    
    render(
      <MemoryDeleteDialog
        isOpen={true}
        onOpenChange={onOpenChange}
        onDelete={onDelete}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
