
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConnectionDetailsModal from '../ConnectionDetailsModal';
import { SocialMediaConnection } from '@/hooks/useSocialMedia';

// Mock the dialog component 
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <p>{children}</p>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>,
}));

describe('ConnectionDetailsModal', () => {
  const mockConnection: SocialMediaConnection = {
    id: '123',
    user_id: 'user123',
    platform: 'Instagram',
    username: 'testuser',
    profile_url: 'https://instagram.com/testuser',
    is_connected: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    oauth_token: 'token123',
    oauth_token_secret: 'refresh123',
    oauth_expires_at: new Date(Date.now() + 86400000).toISOString(),
    meta_data: {
      profile_picture_url: 'https://example.com/pic.jpg',
      followers_count: 1000,
      limited_access: false
    }
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConnectionDetailsModal 
        isOpen={false} 
        onClose={vi.fn()} 
        connection={mockConnection} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <ConnectionDetailsModal 
        isOpen={true} 
        onClose={vi.fn()} 
        connection={mockConnection} 
      />
    );
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Instagram Connection')).toBeInTheDocument();
  });

  it('renders connection details correctly', () => {
    render(
      <ConnectionDetailsModal 
        isOpen={true} 
        onClose={vi.fn()} 
        connection={mockConnection} 
      />
    );
    
    expect(screen.getByText('Username:')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Connected on:')).toBeInTheDocument();
  });

  it('shows empty state when no connection is provided', () => {
    render(
      <ConnectionDetailsModal 
        isOpen={true} 
        onClose={vi.fn()} 
        connection={null} 
      />
    );
    
    expect(screen.getByText('No connection details available')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <ConnectionDetailsModal 
        isOpen={true} 
        onClose={mockOnClose} 
        connection={mockConnection} 
      />
    );
    
    // Since we're mocking the Dialog component, we'll simulate the close action directly
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays limited access warning when applicable', () => {
    const limitedConnection = {
      ...mockConnection,
      meta_data: {
        ...mockConnection.meta_data,
        limited_access: true
      }
    };
    
    render(
      <ConnectionDetailsModal 
        isOpen={true} 
        onClose={vi.fn()} 
        connection={limitedConnection} 
      />
    );
    
    expect(screen.getByText(/This connection has limited access/)).toBeInTheDocument();
  });
});
