
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MenuSelectionModal from '../MenuSelectionModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

// Don't mock the actual components for integration testing
vi.mock('@/components/ui/dialog', async () => {
  const actual = await vi.importActual('@/components/ui/dialog');
  return actual;
});

describe('MenuSelectionModal Integration', () => {
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
  
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    
    // Mock useAuth hook
    (useAuth as any).mockReturnValue({ user: mockUser });
    
    // Mock useToast hook
    (useToast as any).mockReturnValue({ toast: mockToast });
    
    // Mock menu items fetch
    (supabase.from as any).mockImplementation((table) => {
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
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({
                data: [{ menu_item_id: 'item-1' }],
                error: null
              })
            })
          }),
          delete: () => ({
            eq: () => ({
              eq: () => Promise.resolve({
                error: null
              })
            })
          }),
          insert: () => Promise.resolve({
            error: null
          })
        };
      }
      
      return {
        select: vi.fn(),
        delete: vi.fn(),
        insert: vi.fn()
      };
    });
  });

  it('completes full user flow: view items, select items, save selections', async () => {
    // Set up more detailed implementations for Supabase methods
    const mockFrom = vi.fn();
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockOrder = vi.fn();
    const mockDelete = vi.fn();
    const mockInsert = vi.fn();
    
    mockFrom.mockImplementation((table) => {
      if (table === 'restaurant_menu_items') {
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ order: mockOrder });
        mockOrder.mockResolvedValue({ data: mockMenuItems, error: null });
        return { select: mockSelect };
      }
      
      if (table === 'event_menu_selections') {
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ eq: mockEq });
        mockEq.mockResolvedValue({ data: [{ menu_item_id: 'item-1' }], error: null });
        
        mockDelete.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ eq: mockEq });
        mockEq.mockResolvedValue({ error: null });
        
        mockInsert.mockResolvedValue({ error: null });
        
        return {
          select: mockSelect,
          delete: mockDelete,
          insert: mockInsert
        };
      }
      
      return {
        select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ order: vi.fn() }) }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn() }),
        insert: vi.fn()
      };
    });
    
    supabase.from = mockFrom;

    // Render the modal
    render(<MenuSelectionModal {...mockProps} />);
    
    // Wait for menu items to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Assuming MenuItemsList shows menu items as buttons or clickable divs
    // Toggle selection for "Burger"
    fireEvent.click(screen.getByText('Burger'));
    
    // Click save
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check that save API was called
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Selections Saved',
        description: 'Your menu selections have been saved.'
      });
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });
});
