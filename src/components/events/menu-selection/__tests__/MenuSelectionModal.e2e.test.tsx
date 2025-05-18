
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MenuSelectionModal from '../MenuSelectionModal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// Mock dialog for headless testing
vi.mock('@/components/ui/dialog', async () => {
  const actual = await vi.importActual('@/components/ui/dialog');
  return {
    ...actual,
    Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
    DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>
  };
});

describe('MenuSelectionModal E2E Tests', () => {
  const mockProps = {
    eventId: 'event-123',
    restaurantId: 'restaurant-456',
    isOpen: true,
    onClose: vi.fn()
  };
  
  const mockUser = { id: 'user-789', email: 'test@example.com' };
  const mockToast = vi.fn();

  const mockMenuItems = [
    { id: 'item-1', name: 'Pizza', description: 'Cheese pizza', price: 12.99 },
    { id: 'item-2', name: 'Burger', description: 'Beef burger', price: 8.99 },
    { id: 'item-3', name: 'Pasta', description: 'Spaghetti', price: 10.99 }
  ];

  // Setup mock implementations
  const setupMocks = (existingSelections = []) => {
    // Mock auth hook
    (useAuth as any).mockReturnValue({ user: mockUser });
    
    // Mock toast hook
    (useToast as any).mockReturnValue({ toast: mockToast });
    
    // Track Supabase calls for verification
    const supabaseCalls = {
      select: vi.fn(),
      delete: vi.fn(),
      insert: vi.fn()
    };
    
    // Mock Supabase menu items fetch
    const mockFrom = vi.fn().mockImplementation((table) => {
      if (table === 'restaurant_menu_items') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({
                data: mockMenuItems,
                error: null
              })
            })
          })
        };
      }
      
      if (table === 'event_menu_selections') {
        const selectChain = {
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(Promise.resolve({
              data: existingSelections.map(id => ({ menu_item_id: id })),
              error: null
            }))
          })
        };
        
        const deleteChain = {
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(Promise.resolve({
              error: null
            }))
          })
        };
        
        supabaseCalls.select = selectChain.eq;
        supabaseCalls.delete = deleteChain.eq;

        return {
          select: () => selectChain,
          delete: () => deleteChain,
          insert: (data: any) => {
            supabaseCalls.insert(data);
            return Promise.resolve({ error: null });
          }
        };
      }
      
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn() }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn() }),
        insert: vi.fn()
      };
    });
    
    (supabase.from as any) = mockFrom;
    
    return { supabaseCalls };
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the modal with menu items and loads existing selections', async () => {
    // Setup mocks with pre-selected item
    setupMocks(['item-2']);
    
    render(<MenuSelectionModal {...mockProps} />);
    
    // Wait for menu items to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Check if menu items are rendered
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Pasta')).toBeInTheDocument();
    
    // Check pre-selected item (we'd need to check if the item has selected class)
    // This test would be more robust with test IDs or aria roles
    const items = screen.getAllByRole('button');
    
    // Check summary shows correct selected count
    expect(screen.getByText('1 item selected')).toBeInTheDocument();
  });

  it('allows selecting and deselecting menu items', async () => {
    // Setup mocks with no initial selections
    setupMocks([]);
    
    render(<MenuSelectionModal {...mockProps} />);
    
    // Wait for menu items to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Check initial count is 0
    expect(screen.getByText('0 items selected')).toBeInTheDocument();
    
    // Select a menu item (Pizza)
    const pizzaItem = screen.getByText('Pizza').closest('div[role="button"]');
    fireEvent.click(pizzaItem!);
    
    // Check count is updated
    expect(screen.getByText('1 item selected')).toBeInTheDocument();
    
    // Select another menu item (Burger)
    const burgerItem = screen.getByText('Burger').closest('div[role="button"]');
    fireEvent.click(burgerItem!);
    
    // Check count is updated
    expect(screen.getByText('2 items selected')).toBeInTheDocument();
    
    // Deselect Pizza
    fireEvent.click(pizzaItem!);
    
    // Check count is updated back
    expect(screen.getByText('1 item selected')).toBeInTheDocument();
  });

  it('saves selections to the database when Save button is clicked', async () => {
    // Setup mocks and track Supabase calls
    const { supabaseCalls } = setupMocks([]);
    
    render(<MenuSelectionModal {...mockProps} />);
    
    // Wait for menu items to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Select two menu items
    const pizzaItem = screen.getByText('Pizza').closest('div[role="button"]');
    const burgerItem = screen.getByText('Burger').closest('div[role="button"]');
    
    fireEvent.click(pizzaItem!);
    fireEvent.click(burgerItem!);
    
    // Click save button
    const saveButton = screen.getByRole('button', { name: /save selections/i });
    fireEvent.click(saveButton);
    
    // Wait for save operation to complete
    await waitFor(() => {
      // Check toast was called with success message
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Selections Saved'
        })
      );
      
      // Check onClose was called
      expect(mockProps.onClose).toHaveBeenCalled();
    });
    
    // Verify the Supabase delete was called (to clear existing selections)
    expect(supabaseCalls.delete).toHaveBeenCalled();
    
    // Verify the Supabase insert was called with correct data
    expect(supabaseCalls.insert).toHaveBeenCalledWith([
      { event_id: 'event-123', user_id: 'user-789', menu_item_id: 'item-1' },
      { event_id: 'event-123', user_id: 'user-789', menu_item_id: 'item-2' }
    ]);
  });

  it('handles empty selections properly', async () => {
    // Setup mocks and track Supabase calls
    const { supabaseCalls } = setupMocks(['item-1']);
    
    render(<MenuSelectionModal {...mockProps} />);
    
    // Wait for menu items to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Check initially one item is selected
    expect(screen.getByText('1 item selected')).toBeInTheDocument();
    
    // Deselect the item
    const pizzaItem = screen.getByText('Pizza').closest('div[role="button"]');
    fireEvent.click(pizzaItem!);
    
    // Check no items are selected
    expect(screen.getByText('0 items selected')).toBeInTheDocument();
    
    // Click save button
    const saveButton = screen.getByRole('button', { name: /save selections/i });
    fireEvent.click(saveButton);
    
    // Wait for save operation to complete
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Selections Saved'
        })
      );
    });
    
    // Verify the Supabase delete was called but not insert
    expect(supabaseCalls.delete).toHaveBeenCalled();
    expect(supabaseCalls.insert).not.toHaveBeenCalled();
  });

  it('handles error when menu items fail to load', async () => {
    // Mock Supabase to return an error
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'restaurant_menu_items') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({
                data: null,
                error: new Error('Failed to load menu items')
              })
            })
          })
        };
      }
      
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn() }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn() }),
        insert: vi.fn()
      };
    });
    
    (useToast as any).mockReturnValue({ toast: mockToast });
    (useAuth as any).mockReturnValue({ user: mockUser });
    
    render(<MenuSelectionModal {...mockProps} />);
    
    // Wait for error handling
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive'
        })
      );
    });
  });

  it('handles user not being logged in', async () => {
    (useAuth as any).mockReturnValue({ user: null });
    (useToast as any).mockReturnValue({ toast: mockToast });
    
    const { supabaseCalls } = setupMocks([]);
    
    render(<MenuSelectionModal {...mockProps} />);
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Select an item
    const pizzaItem = screen.getByText('Pizza').closest('div[role="button"]');
    fireEvent.click(pizzaItem!);
    
    // Click save button
    const saveButton = screen.getByRole('button', { name: /save selections/i });
    fireEvent.click(saveButton);
    
    // Check error toast is shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'You must be logged in to select menu items.',
          variant: 'destructive'
        })
      );
    });
  });
});
