
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import MenuSelectionModal from '../MenuSelectionModal';
import { useAuth } from '@/hooks/useAuth';
import { useMenuSelections } from '../useMenuSelections';
import { supabase } from '@/integrations/supabase/client';

// Mock the hooks and components
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../useMenuSelections', () => ({
  useMenuSelections: vi.fn()
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode, open: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: { children: React.ReactNode, className?: string }) => 
    <div data-testid="dialog-content" className={className}>{children}</div>
}));

vi.mock('../MenuSelectionHeader', () => ({
  default: () => <div data-testid="menu-selection-header">Menu Selection Header</div>
}));

vi.mock('../MenuItemsList', () => ({
  default: ({ menuItems, selectedItems, loading, onToggleItem }: any) => (
    <div data-testid="menu-items-list">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {menuItems.map((item: any) => (
            <div 
              key={item.id}
              data-testid={`menu-item-${item.id}`}
              data-selected={selectedItems.includes(item.id)}
              onClick={() => onToggleItem(item.id)}
            >
              {item.name} - ${item.price}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}));

vi.mock('../MenuSelectionFooter', () => ({
  default: ({ selectedCount, saving, onCancel, onSave }: any) => (
    <div data-testid="menu-selection-footer">
      <span data-testid="selected-count">{selectedCount} items selected</span>
      <button onClick={onSave} disabled={saving} data-testid="save-button">
        {saving ? 'Saving...' : 'Save'}
      </button>
      <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
    </div>
  )
}));

describe('MenuSelectionModal', () => {
  const mockProps = {
    eventId: 'event-123',
    restaurantId: 'restaurant-456',
    isOpen: true,
    onClose: vi.fn()
  };

  const mockUser = { id: 'user-789', email: 'test@example.com' };
  
  const mockMenuItems = [
    { id: 'item-1', name: 'Pizza', description: 'Cheese pizza', price: 12.99 },
    { id: 'item-2', name: 'Burger', description: 'Beef burger', price: 8.99 }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock useAuth hook
    (useAuth as any).mockReturnValue({ user: mockUser });
    
    // Mock useMenuSelections hook with default values
    (useMenuSelections as any).mockReturnValue({
      menuItems: mockMenuItems,
      selectedItems: ['item-1'],
      loading: false,
      saving: false,
      toggleSelection: vi.fn(),
      handleSave: vi.fn()
    });
  });

  it('renders the modal when isOpen is true', () => {
    render(<MenuSelectionModal {...mockProps} />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(<MenuSelectionModal {...mockProps} isOpen={false} />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('initializes useMenuSelections with correct parameters', () => {
    render(<MenuSelectionModal {...mockProps} />);
    expect(useMenuSelections).toHaveBeenCalledWith(
      mockProps.eventId,
      mockProps.restaurantId,
      mockUser.id,
      mockProps.onClose
    );
  });

  it('displays menu items from useMenuSelections', () => {
    render(<MenuSelectionModal {...mockProps} />);
    expect(screen.getByTestId('menu-items-list')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    (useMenuSelections as any).mockReturnValue({
      menuItems: [],
      selectedItems: [],
      loading: true,
      saving: false,
      toggleSelection: vi.fn(),
      handleSave: vi.fn()
    });
    
    render(<MenuSelectionModal {...mockProps} />);
    expect(screen.getByTestId('menu-items-list')).toBeInTheDocument();
  });

  it('shows saving state in footer when saving', () => {
    (useMenuSelections as any).mockReturnValue({
      menuItems: mockMenuItems,
      selectedItems: ['item-1'],
      loading: false,
      saving: true,
      toggleSelection: vi.fn(),
      handleSave: vi.fn()
    });
    
    render(<MenuSelectionModal {...mockProps} />);
    expect(screen.getByTestId('selected-count')).toHaveTextContent('1 items selected');
    expect(screen.getByTestId('save-button')).toBeDisabled();
  });

  it('passes correct props to MenuSelectionFooter', () => {
    const mockHandleSave = vi.fn();
    (useMenuSelections as any).mockReturnValue({
      menuItems: mockMenuItems,
      selectedItems: ['item-1', 'item-2'],
      loading: false,
      saving: false,
      toggleSelection: vi.fn(),
      handleSave: mockHandleSave
    });
    
    render(<MenuSelectionModal {...mockProps} />);
    expect(screen.getByTestId('selected-count')).toHaveTextContent('2 items selected');
    
    fireEvent.click(screen.getByTestId('save-button'));
    expect(mockHandleSave).toHaveBeenCalled();
    
    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('works with no user logged in', () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    render(<MenuSelectionModal {...mockProps} />);
    expect(useMenuSelections).toHaveBeenCalledWith(
      mockProps.eventId,
      mockProps.restaurantId,
      undefined,
      mockProps.onClose
    );
  });
});
