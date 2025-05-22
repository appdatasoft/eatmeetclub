
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MemoryDetailHeader from '../MemoryDetailHeader';
import { BrowserRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('MemoryDetailHeader', () => {
  it('renders basic layout with back button', () => {
    render(
      <BrowserRouter>
        <MemoryDetailHeader 
          id="123" 
          isOwner={false} 
          onDeleteClick={vi.fn()} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Back to Memories')).toBeInTheDocument();
  });
  
  it('does not show edit/delete buttons when not owner', () => {
    render(
      <BrowserRouter>
        <MemoryDetailHeader 
          id="123" 
          isOwner={false} 
          onDeleteClick={vi.fn()} 
        />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
  
  it('shows edit/delete buttons when user is owner', () => {
    render(
      <BrowserRouter>
        <MemoryDetailHeader 
          id="123" 
          isOwner={true} 
          onDeleteClick={vi.fn()} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
  
  it('calls onDeleteClick when delete button is clicked', () => {
    const onDeleteClick = vi.fn();
    
    render(
      <BrowserRouter>
        <MemoryDetailHeader 
          id="123" 
          isOwner={true} 
          onDeleteClick={onDeleteClick} 
        />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Delete'));
    expect(onDeleteClick).toHaveBeenCalledTimes(1);
  });
});
