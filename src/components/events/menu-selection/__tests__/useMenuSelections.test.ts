
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMenuSelections } from '../useMenuSelections';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis()
  }
}));

describe('useMenuSelections', () => {
  const mockEventId = 'event-123';
  const mockRestaurantId = 'restaurant-456';
  const mockUserId = 'user-789';
  const mockOnClose = vi.fn();
  
  const mockToast = vi.fn();
  
  const mockMenuItems = [
    { id: 'item-1', name: 'Pizza', description: 'Cheese pizza', price: 12.99 },
    { id: 'item-2', name: 'Burger', description: 'Beef burger', price: 8.99 }
  ];
  
  const mockSelections = [
    { menu_item_id: 'item-1' },
    { menu_item_id: 'item-3' }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    
    (useToast as any).mockReturnValue({ toast: mockToast });
    
    // Mock successful menu items fetch
    (supabase.from as any).mockImplementation((table) => {
      if (table === 'restaurant_menu_items') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnValue({
            data: mockMenuItems,
            error: null
          })
        };
      }
      
      if (table === 'event_menu_selections') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis()
        };
      }
      
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      };
    });
    
    // Mock successful user selections fetch
    (supabase.from as any)('event_menu_selections').select.mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      data: mockSelections,
      error: null
    });
    
    // Mock successful delete
    (supabase.from as any)('event_menu_selections').delete.mockReturnValue({
      eq: vi.fn().mockReturnThis()
    });
    
    (supabase.from as any)('event_menu_selections').delete().eq.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        error: null
      })
    });
    
    // Mock successful insert
    (supabase.from as any)('event_menu_selections').insert.mockReturnValue({
      error: null
    });
  });

  it('fetches menu items and user selections on initial load', async () => {
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );

    // Wait for initial fetch to complete
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.menuItems).toEqual(mockMenuItems);
      expect(result.current.selectedItems).toContain('item-1');
      expect(result.current.selectedItems).toContain('item-3');
    });
  });
  
  it('handles error during menu items fetch', async () => {
    // Mock error on menu items fetch
    (supabase.from as any)('restaurant_menu_items').select.mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'Failed to fetch menu items' }
      })
    });
    
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );

    // Wait for fetch to complete
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.menuItems).toEqual([]);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load menu items.',
        variant: 'destructive',
      });
    });
  });
  
  it('handles error during user selections fetch', async () => {
    // Mock error on user selections fetch
    (supabase.from as any)('event_menu_selections').select.mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      data: null,
      error: { message: 'Failed to fetch user selections' }
    });
    
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );

    // Wait for fetch to complete
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.menuItems).toEqual(mockMenuItems);
      expect(result.current.selectedItems).toEqual([]);
    });
  });
  
  it('toggles menu item selection', () => {
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );
    
    // Initially item-1 should be selected based on mock data
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // After toggling, item-1 should be removed
    expect(result.current.selectedItems).not.toContain('item-1');
    
    // Toggle an unselected item
    act(() => {
      result.current.toggleSelection('item-2');
    });
    
    // After toggling, item-2 should be added
    expect(result.current.selectedItems).toContain('item-2');
  });
  
  it('saves menu item selections successfully', async () => {
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );
    
    act(() => {
      result.current.handleSave();
    });
    
    await vi.waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Selections Saved',
        description: 'Your menu selections have been saved.',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
  
  it('handles error during save', async () => {
    // Mock error on insert
    (supabase.from as any)('event_menu_selections').insert.mockReturnValue({
      error: { message: 'Failed to save selections' }
    });
    
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );
    
    act(() => {
      result.current.handleSave();
    });
    
    await vi.waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save your selections.',
        variant: 'destructive',
      });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
  
  it('requires login to save selections', async () => {
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, undefined, mockOnClose)
    );
    
    act(() => {
      result.current.handleSave();
    });
    
    await vi.waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'You must be logged in to select menu items.',
        variant: 'destructive',
      });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
