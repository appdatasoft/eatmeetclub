
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import MemoryDetailHeader from '../MemoryDetailHeader';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('MemoryDetailHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders back button', () => {
    render(
      <MemoryDetailHeader 
        id="123" 
        isOwner={false}
        onDeleteClick={vi.fn()}
      />
    );

    expect(screen.getByText('Back to Memories')).toBeInTheDocument();
  });

  it('navigates back to memories page when back button is clicked', () => {
    render(
      <MemoryDetailHeader 
        id="123" 
        isOwner={false}
        onDeleteClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Back to Memories'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/memories');
  });

  it('does not render edit and delete buttons when user is not owner', () => {
    render(
      <MemoryDetailHeader 
        id="123" 
        isOwner={false}
        onDeleteClick={vi.fn()}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders edit and delete buttons when user is owner', () => {
    render(
      <MemoryDetailHeader 
        id="123" 
        isOwner={true}
        onDeleteClick={vi.fn()}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('navigates to edit page when edit button is clicked', () => {
    render(
      <MemoryDetailHeader 
        id="123" 
        isOwner={true}
        onDeleteClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/memories/123/edit');
  });

  it('calls onDeleteClick when delete button is clicked', () => {
    const mockOnDeleteClick = vi.fn();
    render(
      <MemoryDetailHeader 
        id="123" 
        isOwner={true}
        onDeleteClick={mockOnDeleteClick}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDeleteClick).toHaveBeenCalled();
  });
});
