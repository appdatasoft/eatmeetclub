
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useMenuSelections } from '../useMenuSelections';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { waitForAsync } from '../helpers/test-utils';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('useMenuSelections E2E Tests', () => {
  const eventId = 'event-123';
  const restaurantId = 'restaurant-456';
  const userId = 'user-789';
  const onClose = vi.fn();
  
  const mockToast = vi.fn();
  
  const mockMenuItems = [
    { id: 'item-1', name: 'Pizza', description: 'Cheese pizza', price: 12.99 },
    { id: 'item-2', name: 'Burger', description: 'Beef burger', price: 8.99 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });
  
  const setupSupabaseMocks = (options: {
    menuItemsError?: any, 
    selectionsError?: any,
    existingSelections?: string[],
    deleteError?: any,
    insertError?: any
  } = {}) => {
    const mockFrom = vi.fn().mockImplementation((table) => {
      if (table === 'restaurant_menu_items') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({
                data: options.menuItemsError ? null : mockMenuItems,
                error: options.menuItemsError || null
              })
            })
          })
        };
      }
      
      if (table === 'event_menu_selections') {
        const selections = (options.existingSelections || []).map(id => ({ menu_item_id: id }));
        
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({
                data: options.selectionsError ? null : selections,
                error: options.selectionsError || null
              })
            })
          }),
          delete: () => ({
            eq: () => ({
              eq: () => Promise.resolve({
                error: options.deleteError || null
              })
            })
          }),
          insert: () => Promise.resolve({
            error: options.insertError || null
          })
        };
      }
      
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn(),
            order: vi.fn()
          })
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn()
          })
        }),
        insert: vi.fn()
      };
    });
    
    (supabase.from as any) = mockFrom;
  };

  it('loads menu items and existing selections on mount', async () => {
    // Setup mocks with existing selections
    setupSupabaseMocks({ existingSelections: ['item-1'] });
    
    const { result } = renderHook(() => useMenuSelections(eventId, restaurantId, userId, onClose));
    
    // Initial state should show loading
    expect(result.current.loading).toBe(true);
    
    // Wait for data to load
    await waitForAsync();
    
    // Check loading is complete
    expect(result.current.loading).toBe(false);
    
    // Check menu items were loaded
    expect(result.current.menuItems).toHaveLength(2);
    expect(result.current.menuItems[0].name).toBe('Pizza');
    
    // Check selections were loaded
    expect(result.current.selectedItems).toContain('item-1');
    expect(result.current.selectedItems).toHaveLength(1);
  });

  it('toggles selection of menu items', async () => {
    setupSupabaseMocks();
    
    const { result } = renderHook(() => useMenuSelections(eventId, restaurantId, userId, onClose));
    
    // Wait for data to load
    await waitForAsync();
    
    // Initially no items selected
    expect(result.current.selectedItems).toHaveLength(0);
    
    // Toggle selection for item-1
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // Check item-1 is now selected
    expect(result.current.selectedItems).toContain('item-1');
    expect(result.current.selectedItems).toHaveLength(1);
    
    // Toggle selection for item-2
    act(() => {
      result.current.toggleSelection('item-2');
    });
    
    // Check both items are selected
    expect(result.current.selectedItems).toContain('item-1');
    expect(result.current.selectedItems).toContain('item-2');
    expect(result.current.selectedItems).toHaveLength(2);
    
    // Toggle item-1 again to deselect
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // Check item-1 is removed, only item-2 remains
    expect(result.current.selectedItems).not.toContain('item-1');
    expect(result.current.selectedItems).toContain('item-2');
    expect(result.current.selectedItems).toHaveLength(1);
  });

  it('handles saving selections successfully', async () => {
    setupSupabaseMocks();
    
    const { result } = renderHook(() => useMenuSelections(eventId, restaurantId, userId, onClose));
    
    // Wait for data to load
    await waitForAsync();
    
    // Select an item
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // Save selections
    await act(async () => {
      await result.current.handleSave();
    });
    
    // Check toast was called with success message
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Selections Saved',
      description: 'Your menu selections have been saved.'
    });
    
    // Check onClose was called
    expect(onClose).toHaveBeenCalled();
  });

  it('handles error when saving selections', async () => {
    setupSupabaseMocks({ insertError: new Error('Failed to save') });
    
    const { result } = renderHook(() => useMenuSelections(eventId, restaurantId, userId, onClose));
    
    // Wait for data to load
    await waitForAsync();
    
    // Select an item
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // Try to save selections (should fail)
    await act(async () => {
      await result.current.handleSave();
    });
    
    // Check error toast was called
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to save your selections.',
      variant: 'destructive'
    });
    
    // onClose should not be called on error
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles error when fetching menu items', async () => {
    setupSupabaseMocks({ menuItemsError: new Error('Failed to fetch menu items') });
    
    const { result } = renderHook(() => useMenuSelections(eventId, restaurantId, userId, onClose));
    
    // Wait for error to be processed
    await waitForAsync();
    
    // Check error toast was called
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to load menu items.',
      variant: 'destructive'
    });
    
    // Check loading is complete even after error
    expect(result.current.loading).toBe(false);
    
    // Menu items should be empty
    expect(result.current.menuItems).toHaveLength(0);
  });

  it('still works when user selections fetch fails', async () => {
    setupSupabaseMocks({ selectionsError: new Error('Failed to fetch selections') });
    
    const { result } = renderHook(() => useMenuSelections(eventId, restaurantId, userId, onClose));
    
    // Wait for data to load
    await waitForAsync();
    
    // Menu items should still be loaded
    expect(result.current.menuItems).toHaveLength(2);
    
    // Selected items should be empty due to error
    expect(result.current.selectedItems).toHaveLength(0);
    
    // Should not prevent user from making new selections
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    expect(result.current.selectedItems).toContain('item-1');
  });

  it('validates user is logged in before saving', async () => {
    setupSupabaseMocks();
    
    // Render hook without userId
    const { result } = renderHook(() => useMenuSelections(eventId, restaurantId, undefined, onClose));
    
    // Wait for data to load
    await waitForAsync();
    
    // Select an item
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // Try to save without being logged in
    await act(async () => {
      await result.current.handleSave();
    });
    
    // Should show error toast
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'You must be logged in to select menu items.',
      variant: 'destructive'
    });
  });
});
